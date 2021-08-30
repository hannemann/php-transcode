<?php

namespace App\Models\Video;

use ProtoneMedia\LaravelFFMpeg\MediaOpener;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class File
{
    public static function getMedia(string $disk, string $path): MediaOpener
    {
        return FFMpeg::fromDisk($disk)->open($path);
    }

    /**
     * obtain vdr specific mime types
     * @param string $file filename with absolute path
     * @return string|null
     */
    public static function getMimeType(string $file): ?string
    {
        $baseName = strtolower(pathinfo($file, PATHINFO_BASENAME));
        if (preg_match('/[0-9]{3}\.vdr/', $baseName)) {
            return 'video/mpeg';
        }
        if ('index.vdr' === $baseName || 'index' === $baseName) {
            return 'application/octet-stream';
        }
        return null;
    }
}