<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\CurrentQueue;
use App\Models\Drivers\PsDriver;
use Illuminate\Support\Str;
use App\Helper\Settings;

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

    private static function getProcess(string $path): ?string
    {
        $filename = Settings::getSettings($path)['outFile'];
        if (!$filename) {
            $filename = sha1($path);
        }
        $driver = PsDriver::load(config('process.binaries.ps'));
        $processList = collect(explode("\n", $driver->command(['-axo', 'pid,command'])));
        $idx = $processList->search(function ($item) use ($filename) {
            return Str::containsAll($item, ['ffmpeg', $filename]);
        });
        return $idx ? explode(' ', trim($processList[$idx]))[0] : null;
    }
}
