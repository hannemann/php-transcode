<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\CurrentQueue;
use App\Models\Drivers\PsDriver;
use Illuminate\Support\Str;

class KillFFMpeg
{
    public static function execute(): void
    {
        CurrentQueue::where('state', CurrentQueue::STATE_RUNNING)->get()->each(function ($item) {
            $driver = PsDriver::load(config('process.binaries.kill'));
            if ($pid = static::getProcess($item->path)) {
                $driver->command([$pid]);
            }
            $item->update(['state' => CurrentQueue::STATE_FAILED]);
        });
    }

    private static function getProcess(string $path):? string
    {
        $driver = PsDriver::load(config('process.binaries.ps'));
        $processList = collect(explode("\n", $driver->command(['-axo', 'pid,command'])));
        $idx = $processList->search(function ($item) use ($path) {
            return Str::containsAll($item, ['ffmpeg', sha1($path)]);
        });
        return $idx ? explode(' ', trim($processList[$idx]))[0] : null;
    }
}