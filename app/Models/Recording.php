<?php

namespace App\Models;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Recording
{
    public static function isRecording(string $dir): bool
    {
        return Recording\Vdr::isRecording($dir);
    }

    public static function getItems(string $subdir = null): array
    {
        $directories = Recording::getDirectories($subdir)
            ->map(fn($item) => [
                'name' => basename($item),
                'type' => 'd',
                'path' => $item,
                'channel' => sha1($item)
            ]
        );
        $files = Recording::getFiles($subdir)
            ->map(fn($item) => [
                'name' => basename($item),
                'type' => 'f',
                'path' => $item,
                'channel' => sha1($item)
            ]
        );
        return $directories->merge($files)->toArray();
    }

    public static function getDirectories(string $subdir = null): Collection
    {
        $directories = collect(
            Storage::disk('recordings')->directories($subdir)
        )->filter(fn($dir) => $dir[0] !== '.');

        return $directories;
    }

    public static function getFiles(string $subdir = null): Collection
    {
        $files = collect(
            Storage::disk('recordings')->files($subdir)
        )->filter(fn($file) => $file[0] !== '.');

        return $files;
    }

    public static function getAllDirectories(): Collection
    {
        $directories = collect(
            Storage::disk('recordings')->allDirectories()
        )->filter(fn($dir) => $dir[0] !== '.' && !Str::contains($dir, '/.'));

        return $directories;
    }
}
