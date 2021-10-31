<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class Image
{
    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp, int $width = null, int $height = null, string $out = 'pipe:1')
    {
        $file = static::getInputFilename($disk, $path);
        $args = [
            '-y', '-ss', $timestamp, '-i', $file, '-frames:v', '1', '-f', 'image2'
        ];

        if ($width || $height) {
            $args[] = '-vf';
            $args[] = sprintf('scale=w=%d:h=%d', $width ?? -1, $height ?? -1);
        }

        $args[] = $out;

        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
    }

    public static function saveImage(string $disk, string $path, string $timestamp, int $width = null, int $height = null, $affix = 'image'): string
    {
        $name = sha1($path);
        $outputPath = sprintf(
            '%s/%s',
            config('filesystems.disks.' . $disk . '.root'),
            dirname($path)
        );
        $fullName = $outputPath . DIRECTORY_SEPARATOR . $name . '.' . $affix . '.jpg';
        static::getImageData($disk, $path, $timestamp, $width, $height, $fullName);
        return $fullName;
    }

    public static function getLogoMaskData(string $disk, string $path, string $timestamp, int $width, int $height): string
    {
        $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height);
        $args[] = 'pipe:1';
        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
    }

    public static function createLogoMask(string $disk, string $path, string $timestamp, int $width, int $height): string
    {
        $args = static::getLogomaskArgs($disk, $path, $timestamp, $width, $height);
        $name = sha1($path);
        $outputPath = sprintf(
            '%s/%s',
            config('filesystems.disks.' . $disk . '.root'),
            dirname($path)
        );
        $fullName = $outputPath . DIRECTORY_SEPARATOR . $name . '.logomask.jpg';
        $args[] = $fullName;

        FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
        return $fullName;
    }

    private static function getLogomaskArgs(string $disk, string $path, string $timestamp, int $width, int $height): array
    {
        $file = static::getInputFilename($disk, $path);
        return [
            '-y',
            '-ss', $timestamp,
            '-i', $file,
            '-f', 'lavfi', '-i', 'color=0x030303:' . $width . 'x' . $height,
            '-f', 'lavfi', '-i', 'color=black:' . $width . 'x' . $height,
            '-f', 'lavfi', '-i', 'color=white:' . $width . 'x' . $height,
            '-filter_complex', 'threshold,format=gray',
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