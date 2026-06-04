<?php

namespace App\Models\FFMpeg\Player;

use FFMpeg\Driver\FFMpegDriver;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Drivers\PsDriver;
use App\Models\Video\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Models\FFMpeg\Filters\Video\FilterGraph;
use App\Helper\Settings;
use App\Models\FFMpeg\Filters\Video\ComplexConcat;
use App\Events\FFMpegOut;
use FFMpeg\Coordinate\TimeCode;
use Alchemy\BinaryDriver\Listeners\DebugListener;

class Hls
{
    private $processOutSecond = 0;
    private string $pathHash;
    private float $duration;

    private string $path;

    const TMP_PATH = 'pvr_toolbox_stream';

    const MP4_INIT_FILE = 'init.mp4';

    public function stream(string $disk, string $path, array $config)
    {
        $media = File::getMedia($disk, $path);
        $format = (new h264_vaapi);
        $this->duration = $media->getFormat()->get('duration');
        $this->pathHash = sha1($path);

        $streams = collect($media->getStreams());

        $videoStreams = $streams
            ->filter(fn($stream) => $stream->get('codec_type') === 'video');

        $frameRate = explode('/', $videoStreams->first()->get('r_frame_rate'))[0];

        $videoStreams = $videoStreams->map(fn($stream) => $stream->get('index'))->values();
        $audioStreams = collect($media->getStreams())
            ->filter(fn($stream) => $stream->get('codec_type') === 'audio')->map(fn($stream) => $stream->get('index'))->values();
        $subtitleStreams = collect($media->getStreams())
            ->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')->map(fn($stream) => $stream->get('index'))->values();
        $clips = Settings::getSettings($path)['clips'] ?? [];

        $isComplexConcat = false;
        $filters = collect([]);
        $complexConcat = new ComplexConcat($config['streams'], $videoStreams, $audioStreams, $subtitleStreams, $clips);
        if ($complexConcat->isActive()) {
            $startTime = $config['startTime'] ?? '00:00:00.000';
            $filters = $complexConcat->getFilter($filters, $format, $disk, $path, $startTime);
            $isComplexConcat = true;
        } else {
            $startTime = $config['startTime'] ?? ($clips[0]['from'] ?? '00:00:00.000');
            $filters->push('-filter:v');
            $filterGraph = (string)new FilterGraph($disk, $path, $startTime);
            if ($filterGraph) {
                $filters->push($filterGraph);
            }
        }




        $this->path = $path;

        static::cleanup($disk, $path);
        Storage::disk($disk)->makeDirectory(static::getOutputPath($path));
        Storage::disk($disk)->makeDirectory(static::getMp4InitPath($path));

        $i = $this->getInputFilename($disk, $path);
        $o = dirname($i) . DIRECTORY_SEPARATOR . static::TMP_PATH . DIRECTORY_SEPARATOR;
        $b = implode(DIRECTORY_SEPARATOR, ['stream-segment', dirname($path), static::TMP_PATH]);
        $b = DIRECTORY_SEPARATOR . $b . DIRECTORY_SEPARATOR;
        $args = collect($format->getInitialParameters());

        $args->push('-ss', $startTime);
        if (isset($config['endTime'])) {
            $args->push('-to', $config['endTime']);
        }

        $args->push('-i', $i);

        $args->push('-filter_threads', '8');

        if (!$isComplexConcat) {
            foreach ($config['streams'] as $stream) {
                $args->push('-map', '0:' . $stream['id']);
            }
        }

        $args->push(...$filters);
        $args->push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-tune', 'zerolatency');
        // $args->push('-c:v', 'libsvtav1', '-q', '35');
        $args->push('-c:a', 'aac');
        $args->push('-b:a', '128k');
        $args->push('-ac', '2');
        $args->push('-sc_threshold', '0');
        $args->push('-g', $frameRate);
        $args->push('-hls_playlist_type', 'event');
        $args->push('-hls_time', '4');
        $args->push('-hls_list_size', '0');
        $args->push('-hls_flags', 'independent_segments');
        $args->push('-hls_base_url', $b);
        $args->push('-hls_segment_type', 'fmp4');
        $args->push('-hls_fmp4_init_filename', $b . self::MP4_INIT_FILE);
        $args->push('-hls_segment_filename', $o . 'hls-%03d.m4s');
        $args->push('-master_pl_name', 'master.m3u8');
        $args->push($o . 'hls.m3u8');

        $bypassErrors = false;
        $driver = FFMpegDriver::create(null, Arr::dot(config('laravel-ffmpeg')));

        $binary = $driver->getConfiguration()->get('ffmpeg.binaries');
        $command = collect($args)->prepend($binary)->implode(' ');
        Log::info($command);

        $broadcaster = \Closure::fromCallable([$this, 'broadcastProcessOutput']);
        $listener = new DebugListener();
        $driver->listen($listener);
        $driver->on('debug', $broadcaster);

        $driver->command($args->all(), $bypassErrors);
    }

    public static function playlist(string $disk, string $path): string
    {
        $wait = 0;
        $playlist = static::getPlayListName($path);
        while ($wait++ < 10 && !Storage::disk($disk)->exists($playlist)) {
            sleep(1);
        }
        return Storage::disk($disk)->get($playlist);
    }

    public static function segment(string $disk, string $path)
    {
        if (Str::contains($path, self::MP4_INIT_FILE)) {
            $path = dirname($path) . DIRECTORY_SEPARATOR . 'stream-segment' . DIRECTORY_SEPARATOR . $path;
        }
        return Storage::disk($disk)->get($path);
    }

    public static function cleanup(string $disk, string $path): void
    {
        $driver = PsDriver::load(config('process.binaries.kill'));
        if ($pid = static::getProcess()) {
            $driver->command([$pid]);
        }
        $wait = 0;
        while ($wait++ < 10 && static::getProcess()) {
            sleep(1);
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
        return dirname($path) . DIRECTORY_SEPARATOR . static::TMP_PATH . DIRECTORY_SEPARATOR . 'hls.m3u8';
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
        return dirname($path) . DIRECTORY_SEPARATOR . static::TMP_PATH;
    }

    private static function getMp4InitPath(string $path): string
    {
        $p = static::getOutputPath($path);
        return $p . DIRECTORY_SEPARATOR . 'stream-segment' . DIRECTORY_SEPARATOR . $p;
    }

    private static function getProcess(): ?string
    {
        $driver = PsDriver::load(config('process.binaries.ps'));
        $processList = collect(explode("\n", $driver->command(['-axo', 'pid,command'])));
        $idx = $processList->search(function ($item) {
            return Str::containsAll($item, ['ffmpeg', static::TMP_PATH, 'hls']);
        });
        return $idx ? explode(' ', trim($processList[$idx]))[0] : null;
    }

    private function broadcastProcessOutput(string $line): void
    {
        $processOutSecond = time();
        if ($processOutSecond > $this->processOutSecond && strpos($line, '[ERROR] frame=') === 0) {
            $this->processOutSecond = $processOutSecond;
            $lines = explode("\r", trim($line));
            $line = trim(array_pop($lines));
            $clips = [[
                'from' => '00:00:00.000',
                'to' => (string)TimeCode::fromSeconds($this->duration)
            ]];
            FFMpegOut::dispatch($this->pathHash, [
                'line' => str_replace('[ERROR] ', '', $line),
                'clips' => $clips,
                'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            ]);
        }
    }
}
