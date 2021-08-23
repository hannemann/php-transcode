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

    public static function getDirectories(): Collection
    {
        $directories = collect(
            Storage::disk('recordings')->directories()
        )->filter(fn($dir) => $dir[0] !== '.');

        return $directories;
    }

    public static function getAllDirectories(): Collection
    {
        $directories = collect(
            Storage::disk('recordings')->allDirectories()
        )->filter(fn($dir) => $dir[0] !== '.' && !Str::contains($dir, '/.'));

        return $directories;
    }
}
