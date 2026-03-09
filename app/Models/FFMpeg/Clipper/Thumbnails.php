<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Facades\Storage;

class Thumbnails
{
    /**
     * Generate thumbnails using FFMpegDriver in parallel batches.
     */
    public static function createThumbnails(string $disk, string $path, float $duration, int $count = 50)
    {
        $sourceStorage = Storage::disk($disk);
        $fullInputPath = $sourceStorage->path($path);
        $publicStorage = Storage::disk('public');

        $videoHash = md5($fullInputPath);
        $thumbFolderName = 'thumbs/' . $videoHash;

        if ($duration <= 0) return [];

        if ($publicStorage->exists($thumbFolderName)) $publicStorage->deleteDirectory($thumbFolderName);
        $publicStorage->makeDirectory($thumbFolderName);

        $fullOutputPath = $publicStorage->path($thumbFolderName);

        $cores = self::getCpuCoreCount();
        $numProcesses = max(1, min($cores - 1, 8));
        $itemsPerBatch = ceil($count / $numProcesses);

        $processes = [];
        $driver = FFMpegDriver::create(); // Create the driver instance once

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

            // Phase 2: Mappings
            for ($i = $startIdx; $i < $endIdx; $i++) {
                $localIdx = $i - $startIdx;
                $globalIdx = str_pad($i + 1, 3, '0', STR_PAD_LEFT);
                array_push(
                    $batchArgs,
                    '-map',
                    "{$localIdx}:v:0",
                    '-frames:v',
                    '1',
                    '-an',
                    '-sn',
                    '-vf',
                    'scale=40:30',
                    '-q:v',
                    '10',
                    "{$fullOutputPath}/thumb_{$globalIdx}.jpg"
                );
            }

            // We use the driver to give us the command string, but execute it ourselves for parallelism
            $processes[] = self::runBackgroundProcess($driver, $batchArgs);
        }

        foreach ($processes as $proc) {
            if (is_resource($proc)) {
                while (proc_get_status($proc)['running']) {
                    usleep(5000);
                }
                proc_close($proc);
            }
        }

        return array_map(fn($file) => '/storage/thumbs/' . $videoHash . '/' . basename($file), $publicStorage->files($thumbFolderName));
    }

    /**
     * Uses the FFMpegDriver's configuration to run a background process.
     */
    private static function runBackgroundProcess(FFMpegDriver $driver, array $args)
    {
        // Get the binary path from the driver configuration
        $binary = $driver->getProcessBuilderFactory()->getBinary();

        // Build the command
        $command = escapeshellarg($binary) . ' ' . implode(' ', array_map('escapeshellarg', $args));

        $descriptorspec = [
            0 => ["pipe", "r"],
            1 => ["file", "/dev/null", "w"],
            2 => ["file", "/dev/null", "w"]
        ];

        return proc_open($command, $descriptorspec, $pipes);
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
