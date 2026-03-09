<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Facades\Storage;

class Thumbnails
{
    /**
     * Generate thumbnails using FFMpegDriver with Pipe-Streaming (RAM-only).
     */
    public static function createThumbnails(string $disk, string $path, float $duration, int $count = 50)
    {
        $sourceStorage = Storage::disk($disk);
        $fullInputPath = $sourceStorage->path($path);
        $publicStorage = Storage::disk('public');
        $videoHash = md5($fullInputPath);
        $targetDir = 'thumbs/' . $videoHash;

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

            // Phase 1: FAST-SEEK Inputs
            for ($i = $startIdx; $i < $endIdx; $i++) {
                $timestamp = ($duration / $count) * $i;
                array_push($batchArgs, '-ss', (string)$timestamp, '-i', $fullInputPath);
            }

            // Phase 2: Pipe-Streaming Configuration
            for ($i = $startIdx; $i < $endIdx; $i++) {
                array_push(
                    $batchArgs,
                    '-map',
                    ($i - $startIdx) . ':v:0',
                    '-frames:v',
                    '1',
                    '-an',
                    '-sn',
                    '-vf',
                    'scale=40:30',
                    '-q:v',
                    '10',
                    '-f',
                    'image2pipe', // Stream as binary
                    'pipe:1'
                );
            }

            $processes[] = [
                'proc' => self::runPipedProcess($binary, $batchArgs),
                'startIdx' => $startIdx
            ];
        }

        // read result from ram
        foreach ($processes as $pData) {
            $proc = $pData['proc']['proc'];
            $pipes = $pData['proc']['pipes'];

            $binaryData = stream_get_contents($pipes[1]);
            fclose($pipes[0]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($proc);

            // explode JPEGs in ram(JPEG Magic Bytes: FFD8...FFD9)
            $frames = preg_split('/(?=\xFF\xD8\xFF)/', $binaryData, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($frames as $idx => $frameData) {
                $globalIdx = str_pad($pData['startIdx'] + $idx + 1, 3, '0', STR_PAD_LEFT);
                $publicStorage->put("{$targetDir}/thumb_{$globalIdx}.jpg", $frameData);
            }
        }

        return array_map(fn($file) => '/storage/' . $targetDir . '/' . basename($file), $publicStorage->files($targetDir));
    }

    private static function runPipedProcess(string $binary, array $args)
    {
        $command = escapeshellarg($binary) . ' ' . implode(' ', array_map('escapeshellarg', $args));
        $descriptorspec = [
            0 => ["pipe", "r"], // stdin
            1 => ["pipe", "w"], // stdout (Binary Stream)
            2 => ["pipe", "w"]  // stderr
        ];
        $pipes = [];
        $proc = proc_open($command, $descriptorspec, $pipes);
        return ['proc' => $proc, 'pipes' => $pipes];
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
