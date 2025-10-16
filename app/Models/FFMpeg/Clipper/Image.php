<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;
use App\Models\FFMpeg\Filters\Video\FilterGraph;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

class Image
{
    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp, ?int $width = null, ?int $height = null, bool $filtered, string $out = 'pipe:1')
    {
        $file = static::getInputFilename($disk, $path);
        $args = [
            '-y', '-ss', $timestamp, '-i', $file, '-frames:v', '1', '-f', 'image2pipe'
        ];

        $filters = collect([]);

        if ($filtered) {
            $filterGraph = (string)new FilterGraph($disk, $path);
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

    public static function getLogoMaskData(string $disk, string $path, string $timestamp, int $width, int $height): string
    {
        $filterGraph = (string)new FilterGraph($disk, $path);
        $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height, $filterGraph);
        $args[] = 'pipe:1';
        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
    }

    public static function createLogoMask(string $disk, string $path, string $timestamp, int $width, int $height, ?string $withFilters = ''): string
    {
        $name = sha1($path . $timestamp);
        $outputPath = sprintf(
            '%s/%s',
            config('filesystems.disks.' . $disk . '.root'),
            dirname($path)
        );
        $fullName = $outputPath . DIRECTORY_SEPARATOR . $name . '.logomask.jpg';

        if (!Storage::disk($disk)->exists($fullName)) {
            $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height, $withFilters);
            $args[] = $fullName;
            FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
        }
        return $fullName;
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
}