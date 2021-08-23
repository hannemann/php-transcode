<?php

namespace App\Models;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

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
}
