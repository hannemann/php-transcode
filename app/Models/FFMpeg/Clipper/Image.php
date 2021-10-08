<?php

namespace App\Models\FFMpeg\Clipper;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;

class Image
{
    /**
     * create image from timestamp
     */
    public static function getImageData(string $disk, string $path, string $timestamp, int $height = null)
    {
        $file = static::getInputFilename($disk, $path);
        $args = [
            '-ss', $timestamp, '-i', $file, '-r', '25', '-frames:v', '1', '-f', 'image2'
        ];

        if ($height) {
            $args[] = '-vf';
            $args[] = 'scale=w=-1:h=' . $height;
        }

        $args[] = 'pipe:1';

        return FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args);
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