<?php

namespace App\Models\Recording;

use App\Models\Recording;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Illuminate\Support\Str;

class Vdr extends Recording
{
    public static function isRecording(string $dir): bool
    {
        $files = collect(Storage::disk('recordings')->allFiles());

        return $files->contains('00001.ts') || $files->contains('001.vdr');
    }

    public static function  getMediaInfo($dir)
    {
        $subDir = collect(Storage::disk('recordings')->directories($dir))->filter(fn($dir) => !Str::contains($dir, '/.'))->first();
        $media = FFMpeg::fromDisk('recordings')->open($subDir . '/00001.ts');

        return $media;
    }
}