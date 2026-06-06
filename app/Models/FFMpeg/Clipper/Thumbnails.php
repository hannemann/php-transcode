<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Facades\Storage;

class Thumbnails
{
    public static function createThumbnails(string $disk, string $path, float $duration, int $count = 50)
    {
        $sourceStorage = Storage::disk($disk);
        $fullInputPath = $sourceStorage->path($path);
        $publicStorage = Storage::disk('public');
        $videoHash = md5($fullInputPath);
        $targetDir = 'thumbs/' . $videoHash;
        $targetPath = $publicStorage->path($targetDir);

        if ($duration <= 0) return [];
        if ($publicStorage->exists($targetDir)) $publicStorage->deleteDirectory($targetDir);
        $publicStorage->makeDirectory($targetDir);

        $cores = self::getCpuCoreCount();
        $numProcesses = max(1, min($cores - 1, 8));
        $itemsPerBatch = ceil($count / $numProcesses);

        $processes = [];
        $driver = FFMpegDriver::create();
        $binary = $driver->getProcessBuilderFactory()->getBinary();

        for ($p = 0; $p < $numProcesses; $p++) {
            $startIdx = (int)($p * $itemsPerBatch);
            $endIdx = (int)min($startIdx + $itemsPerBatch, $count);
            if ($startIdx >= $count) break;

            $batchArgs = ['-y', '-hide_banner', '-loglevel', 'error', '-noautorotate', '-dn'];

            for ($i = $startIdx; $i < $endIdx; $i++) {
                $timestamp = ($duration / $count) * $i;
                array_push($batchArgs, '-skip_frame', 'nokey', '-ss', (string)$timestamp, '-i', $fullInputPath);
            }

            for ($i = $startIdx; $i < $endIdx; $i++) {
                $globalIdx = str_pad($i + 1, 3, '0', STR_PAD_LEFT);
                $outputPath = "{$targetPath}/thumb_{$globalIdx}.jpg";

                array_push(
                    $batchArgs,
                    '-map',
                    ($i - $startIdx) . ':v:0',
                    '-frames:v',
                    '1',
                    '-an',
                    '-sn',
                    '-vf',
                    'scale=40:30:flags=neighbor',
                    '-q:v',
                    '15',
                    $outputPath
                );
            }

            $command = escapeshellarg($binary) . ' ' . implode(' ', array_map('escapeshellarg', $batchArgs));
            $processes[] = $command;
        }

        $cmdBatches = array_chunk($processes, $numProcesses);
        foreach ($cmdBatches as $batch) {
            $procs = [];
            foreach ($batch as $cmd) {
                $procs[] = self::runProcess($cmd);
            }
            foreach ($procs as $proc) {
                proc_close($proc);
            }
        }

        $files = $publicStorage->files($targetDir);
        sort($files, SORT_NATURAL);

        return array_map(fn($file) => '/storage/' . $targetDir . '/' . basename($file), $files);
    }

    private static function runProcess(string $command)
    {
        $descriptorspec = [
            0 => ["pipe", "r"],
            1 => ["file", "/dev/null", "w"],
            2 => ["file", "/dev/null", "w"],
        ];
        $pipes = [];
        $proc = proc_open($command, $descriptorspec, $pipes);
        fclose($pipes[0]);
        return $proc;
    }

    private static function getCpuCoreCount(): int
    {
        if (is_readable('/proc/cpuinfo')) {
            $cpuinfo = file_get_contents('/proc/cpuinfo');
            preg_match_all('/^processor/m', $cpuinfo, $matches);
            return count($matches[0]) ?: 4;
        }
        return (int)shell_exec('nproc') ?: 4;
    }
}
