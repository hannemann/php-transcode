<?php

namespace App\Models\Recording;

use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Illuminate\Support\Str;

class Vdr
{
    public static function  getMediaInfo($dir)
    {
        $subDir = collect(Storage::disk('recordings')->directories($dir))->filter(fn($dir) => !Str::contains($dir, '/.'))->first();
        $media = FFMpeg::fromDisk('recordings')->open($subDir . '/00001.ts');

        return $media;
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
        if ('index.vdr' === $baseName) {
            return 'application/octet-stream';
        }
        return null;
    }

    /**
     * determine if file is a legacy vdr recording
     * @param string $file filename with absolute path
     * @return bool
     */
    public static function isLegacy(string $file): bool
    {
        return 'vdr' === strtolower(pathinfo($file, PATHINFO_EXTENSION));
    }
}