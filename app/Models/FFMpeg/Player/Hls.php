<?php

namespace App\Models\FFMpeg\Player;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Drivers\PsDriver;
use Illuminate\Support\Str;

class Hls
{

    public function stream(string $disk, string $path)
    {
        $this->path = $path;
        $format = (new h264_vaapi);

        static::cleanup($disk, $path);
        Storage::disk($disk)->makeDirectory(static::getOutputPath($path));

        $i = $this->getInputFilename($disk, $path);
        $o = dirname($i) . DIRECTORY_SEPARATOR . 'pvr_toolbox_stream' . DIRECTORY_SEPARATOR;
        $b = implode(DIRECTORY_SEPARATOR, ['stream-segment', dirname($path), 'pvr_toolbox_stream']);
        $b = DIRECTORY_SEPARATOR . $b . DIRECTORY_SEPARATOR;
        $args = collect($format->getInitialParameters());
        $args->push('-i', $i);
        $args->push('-map', '0:v:0');
        $args->push('-map', '0:a:0');
        $args->push('-c:v', 'copy');
        $args->push('-c:a', 'aac');
        $args->push('-b:a', '128k');
        $args->push('-ac', '2');
        $args->push('-sc_threshold', '0');
        $args->push('-g', '48');
        $args->push('-hls_playlist_type', 'event');
        $args->push('-hls_time', '10');
        $args->push('-hls_base_url', $b);
        $args->push('-hls_segment_filename', $o . 'hls-%03d.ts');
        $args->push('-master_pl_name', 'master_0.m3u8');
        $args->push($o . 'hls.m3u8');

        FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')))->command($args->all());
    }

    public static function playlist(string $disk, string $path): string
    {
        $attempts = 0;
        $playlist = static::getPlayListName($path);
        while ($attempts < 10 && !Storage::disk($disk)->exists($playlist)) {
            sleep(1);
        }
        return Storage::disk($disk)->get($playlist);
    }

    public static function segment(string $disk, string $path)
    {
        return Storage::disk($disk)->get($path);
    }

    public static function cleanup(string $disk, string $path): void
    {
        $driver = PsDriver::load(config('process.binaries.kill'));
        if ($pid = static::getProcess()) {
            $driver->command([$pid]);
        }

        $ro = static::getOutputPath($path);
        $d = Storage::disk($disk);
        if ($d->exists($ro)) {
            $files = $d->files($path);
            $d->delete($files);
            $d->deleteDirectory($ro);
        }
    }

    private static function getPlayListName(string $path): string
    {
        return dirname($path) . DIRECTORY_SEPARATOR . 'pvr_toolbox_stream' . DIRECTORY_SEPARATOR . 'hls.m3u8';
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

    private static function getOutputPath(string $path): string
    {
        return dirname($path) . DIRECTORY_SEPARATOR . 'pvr_toolbox_stream';
    }

    private static function getProcess():? string
    {
        $driver = PsDriver::load(config('process.binaries.ps'));
        $processList = collect(explode("\n", $driver->command(['-axo', 'pid,command'])));
        $idx = $processList->search(function ($item) {
            return Str::containsAll($item, ['ffmpeg', 'pvr_toolbox_stream', 'hls']);
        });
        return $idx ? explode(' ', trim($processList[$idx]))[0] : null;
    }
}