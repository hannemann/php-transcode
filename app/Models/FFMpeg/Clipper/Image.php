<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;
use App\Models\FFMpeg\Filters\Video\FilterGraph;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use App\Exceptions\VideoEditor\InvalidMaskCoverageException;
use App\Models\FFMpeg\Actions\RemovelogoCPU;

class Image
{
    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp, ?int $width = null, ?int $height = null, bool $filtered, ?int $currentFilter, string $out = 'pipe:1')
    {
        $file = static::getInputFilename($disk, $path);
        $args = [
            '-y', '-ss', $timestamp, '-i', $file, '-frames:v', '1', '-f', 'image2pipe'
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

    public static function getLogoMaskFullnameByPath(string $path): ?string {

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
            '-ss', $timestamp,
            '-i', $file,
            '-f', 'lavfi', '-i', 'color=0x030303:' . $width . 'x' . $height,
            '-f', 'lavfi', '-i', 'color=black:' . $width . 'x' . $height,
            '-f', 'lavfi', '-i', 'color=white:' . $width . 'x' . $height,
            '-filter_complex', sprintf('%sthreshold,format=gray', $filterGraph),
            '-frames:v', '1',
            '-f', 'image2'
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

    public static function getNonBlackPercentage($path) {
        $args = [
            '-i', $path,
            '-vf', 'format=pix_fmts=rgb24,format=gray',
            '-f', 'rawvideo',
            '-pix_fmt', 'gray',
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
}