<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use FFMpeg\Driver\FFProbeDriver;
use Illuminate\Support\Arr;
use App\Models\FFMpeg\Filters\Video\FilterGraph;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use App\Exceptions\VideoEditor\InvalidMaskCoverageException;
use App\Models\FFMpeg\Actions\RemovelogoCPU;

class Image
{
    /**
     * Create all thumbnails for a video at once in the public directory.
     * 
     * @param string $disk The name of the Laravel disk where the source video is stored.
     * @param string $path The path to the video file within the specified disk.
     * @param int $count The number of thumbnails to generate.
     * @return array A list of relative paths for the generated thumbnails.
     */
    /**
     * Generate thumbnails in parallel batches for maximum speed on multi-core CPUs.
     */
    /**
     * Generate thumbnails in parallel batches using all available CPU power.
     *
     * @param string $disk Source video disk
     * @param string $path Path to the video file
     * @param int $count Total number of thumbnails
     * @return array List of public URLs
     */
    public static function createThumbnails(string $disk, string $path, int $count = 50)
    {
        $sourceStorage = Storage::disk($disk);
        $fullInputPath = $sourceStorage->path($path);
        $publicStorage = Storage::disk('public');

        $videoHash = md5($fullInputPath);
        $thumbFolderName = 'thumbs/' . $videoHash;

        $duration = static::getVideoDuration($fullInputPath);
        if ($duration <= 0) return [];

        if ($publicStorage->exists($thumbFolderName)) $publicStorage->deleteDirectory($thumbFolderName);
        $publicStorage->makeDirectory($thumbFolderName);

        $fullOutputPath = $publicStorage->path($thumbFolderName);

        // Parallel processing setup
        $numProcesses = 5; // Strategic choice for an 8-core CPU
        $itemsPerBatch = ceil($count / $numProcesses);
        $processes = [];

        for ($p = 0; $p < $numProcesses; $p++) {
            $startIdx = $p * $itemsPerBatch;
            $endIdx = min($startIdx + $itemsPerBatch, $count);

            if ($startIdx >= $count) break;

            // Base arguments for maximum speed
            $batchArgs = [
                '-y',
                '-hide_banner',
                '-loglevel',
                'error',
                '-noautorotate' // Skip metadata rotation check
            ];

            // Phase 1: FAST-SEEK Inputs
            for ($i = $startIdx; $i < $endIdx; $i++) {
                $timestamp = ($duration / $count) * $i;
                $batchArgs[] = '-ss';
                $batchArgs[] = (string)$timestamp;
                $batchArgs[] = '-i';
                $batchArgs[] = $fullInputPath;
            }

            // Phase 2: Mappings and Stream-Stripping
            for ($i = $startIdx; $i < $endIdx; $i++) {
                $localIdx = $i - $startIdx;
                $globalIdx = str_pad($i + 1, 3, '0', STR_PAD_LEFT);

                $batchArgs[] = '-map';
                $batchArgs[] = "{$localIdx}:v:0";
                $batchArgs[] = '-frames:v';
                $batchArgs[] = '1';

                // THE OPTIMIZATION: Strip everything but video
                $batchArgs[] = '-an'; // No Audio
                $batchArgs[] = '-sn'; // No Subtitles
                $batchArgs[] = '-dn'; // No Data-streams

                $batchArgs[] = '-vf';
                $batchArgs[] = 'scale=40:30';
                $batchArgs[] = '-q:v';
                $batchArgs[] = '10';
                $batchArgs[] = "{$fullOutputPath}/thumb_{$globalIdx}.jpg";
            }

            // Trigger background execution
            $processes[] = self::runBackgroundFFmpeg($batchArgs);
        }

        // Wait for all parallel batches to complete
        foreach ($processes as $proc) {
            while (proc_get_status($proc)['running']) {
                usleep(5000); // 5ms polling for ultra-low latency
            }
            proc_close($proc);
        }

        return array_map(fn($file) => '/storage/thumbs/' . $videoHash . '/' . basename($file), $publicStorage->files($thumbFolderName));
    }

    /**
     * Execute FFmpeg as a non-blocking background process.
     */
    private static function runBackgroundFFmpeg(array $args)
    {
        // Escaping all arguments for secure shell execution
        $command = 'ffmpeg ' . implode(' ', array_map('escapeshellarg', $args));

        $descriptorspec = [
            0 => ["pipe", "r"], // stdin
            1 => ["pipe", "w"], // stdout
            2 => ["pipe", "w"]  // stderr
        ];

        return proc_open($command, $descriptorspec, $pipes);
    }

    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp, ?int $width = null, ?int $height = null, ?bool $filtered = false, ?int $currentFilter = null, string $out = 'pipe:1')
    {
        $file = static::getInputFilename($disk, $path);
        $args = [
            '-y',
            '-ss',
            $timestamp,
            '-i',
            $file,
            '-frames:v',
            '1',
            '-f',
            'image2pipe'
        ];

        $filters = collect([]);

        if ($filtered) {
            $filterGraph = (string)new FilterGraph($disk, $path, $timestamp, $currentFilter);
            if ($filterGraph) {
                $filters->push((string)$filterGraph);
            }
        }

        if ($width || $height) {
            $filters->push(sprintf('scale=w=%d:h=%d', $width ?? -1, $height ?? -1));
        }

        if ($filters->isNotEmpty()) {
            $args[] = '-filter:v';
            $args[] = $filters->join(',');
        }

        $args[] = $out;

        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
    }

    public static function saveImage(string $disk, string $path, string $timestamp, ?int $width = null, ?int $height = null, $affix = 'image'): string
    {
        $name = sha1($path);
        $outputPath = sprintf(
            '%s/%s',
            config('filesystems.disks.' . $disk . '.root'),
            dirname($path)
        );
        $fullName = $outputPath . DIRECTORY_SEPARATOR . $name . '.' . $affix . '.jpg';
        static::getImageData($disk, $path, $timestamp, $width, $height, false, $fullName);
        return $fullName;
    }

    public static function getLogoMaskData(string $disk, string $path, string $timestamp, int $width, int $height, ?int $currentFilter): string
    {
        $filterGraph = (string)new FilterGraph($disk, $path, $timestamp, $currentFilter);
        $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height, $filterGraph);
        $args[] = 'pipe:1';
        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
    }

    public static function createLogoMask(string $disk, string $path, string $timestamp, ?int $width = null, ?int $height = null, ?string $withFilters = ''): string
    {
        $filename = self::getLogoMaskFilename($path, $timestamp);
        $fullName = self::getLogoMaskFullname($disk, $path, $timestamp);

        if (!Storage::disk($disk)->exists($filename)) {
            $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height, $withFilters);
            $args[] = $fullName;
            FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
        }
        return $fullName;
    }

    public static function createLogoMaskFromDataURL(string $path, string $imageBase64): void
    {
        $imageName = 'logomask.png';

        $base64Data = preg_replace('/^data:[^,]*,/', '', $imageBase64);
        $decodedData = base64_decode($base64Data);
        if (!$decodedData) {
            throw new \Exception("Invalid base64 data");
        }

        $image = imagecreatefromstring($decodedData);
        if (!$image) {
            throw new \Exception("Could not create image from string");
        }

        imagealphablending($image, false);
        imagesavealpha($image, true);

        ob_start();
        imagepng($image, null, -1);
        $imageData = ob_get_clean();
        imagedestroy($image);

        $targetPath = dirname($path) . DIRECTORY_SEPARATOR . $imageName;
        Storage::disk('recordings')->put($targetPath, $imageData);
    }

    public static function getLogoMaskFullnameByPath(string $path): ?string
    {

        $customMask = RemovelogoCPU::getCustomMaskPath($path);

        if (RemovelogoCPU::hasCustomMask($customMask)) {
            return sprintf(
                '%s/%s',
                config('filesystems.disks.recordings.root'),
                $customMask
            );
        } else {
            $filterGraph = new FilterGraph('recordings', $path);
            $removeLogo = $filterGraph->getSettings()->firstWhere('filterType', 'removeLogo');
            if (!$removeLogo) return null;
            $timestamp = $removeLogo['timestamp'];
            // force filterGraph execution
            (string)$filterGraph;
            return self::getLogoMaskFullname('recordings', $path, $timestamp);
        }
    }

    public static function getLogoMaskFilename(string $path, string $timestamp): string
    {
        return sprintf(
            '%s%s%s%s',
            dirname($path),
            DIRECTORY_SEPARATOR,
            sha1($path . $timestamp),
            '.logomask.png'
        );
    }

    public static function getLogoMaskFullname(string $disk, string $path, string $timestamp): string
    {
        return sprintf(
            '%s%s%s',
            config('filesystems.disks.' . $disk . '.root'),
            DIRECTORY_SEPARATOR,
            self::getLogoMaskFilename($path, $timestamp)
        );
    }

    private static function getLogomaskArgs(string $disk, string $path, string $timestamp, int $width, int $height, ?string $withFilters = null): array
    {
        $file = static::getInputFilename($disk, $path);

        $filterGraph = '';
        if ($withFilters) {
            $filterGraph = $withFilters . ',';
        }

        return [
            '-y',
            '-ss',
            $timestamp,
            '-i',
            $file,
            '-f',
            'lavfi',
            '-i',
            'color=0x030303:' . $width . 'x' . $height,
            '-f',
            'lavfi',
            '-i',
            'color=black:' . $width . 'x' . $height,
            '-f',
            'lavfi',
            '-i',
            'color=white:' . $width . 'x' . $height,
            '-filter_complex',
            sprintf('%sthreshold,format=gray', $filterGraph),
            '-frames:v',
            '1',
            '-f',
            'image2'
        ];
    }

    /**
     * obtain input filename
     */
    private static function getInputFilename(string $disk, string $path): string
    {
        return sprintf(
            '%s/%s',
            config('filesystems.disks.' . $disk . '.root'),
            $path
        );
    }

    public static function getNonBlackPercentage($path)
    {
        $args = [
            '-i',
            $path,
            '-vf',
            'format=pix_fmts=rgb24,format=gray',
            '-f',
            'rawvideo',
            '-pix_fmt',
            'gray',
            '-'
        ];

        $data = FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
        $totalBytes = strlen($data);

        if ($totalBytes === 0) return 0;

        $stats = count_chars($data, 1);

        // Wir summieren alle Pixel, die "schwarz genug" sind (0 bis 10)
        $blackBytes = 0;
        for ($i = 0; $i <= 10; $i++) {
            $blackBytes += $stats[$i] ?? 0;
        }

        // Alles was übrig bleibt, ist "echtes" Weiß/Grau (Last für FFmpeg)
        $percentage = (($totalBytes - $blackBytes) / $totalBytes) * 100;

        if ($percentage > 10) {
            throw new InvalidMaskCoverageException($percentage);
        }

        return $percentage;
    }

    /**
     * obtain video duration
     */
    public static function getVideoDuration(string $fullPath): float
    {
        $args = [
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-of',
            'json',
            $fullPath
        ];

        try {
            $ffprobe = FFProbeDriver::create($args);
            $output = $ffprobe->command($args);
            $data = json_decode($output, true);

            if (isset($data['format']['duration'])) {
                return (float) $data['format']['duration'];
            }
        } catch (\Exception $e) {
            \Log::error("FFprobe error: " . $e->getMessage());
        }

        return 0.0;
    }
}
