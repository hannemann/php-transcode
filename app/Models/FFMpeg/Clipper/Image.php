<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;

class Image
{
    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp)
    {
        $file = static::getInputFilename($disk, $path);

        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command([
            '-ss', $timestamp, '-i', $file, '-r', '25', '-frames:v', '1', '-f', 'image2', 'pipe:1'
        ]);
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