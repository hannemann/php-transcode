<?php

namespace App\Models\FFMpeg;

use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use App\Events\FFMpegProcess as FFMpegProcessEvent;
use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Collection;

class Transcode
{
    public function __construct(string $disk, string $path, array $streams, string $clipStart = null, string $clipEnd = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->streams = $streams;
        $this->clipStart = $clipStart;
        $this->clipEnd = $clipEnd;
    }

    public function execute()
    {
        $format = new h264_vaapi();
        $format->setConstantQuantizationParameter();
        $format->setAudioCodec('copy');
        $format->unsetAudioKiloBitrate();
        $out = $this->getOutputFilename();

        $media = FFMpeg::fromDisk($this->disk)->open($this->path);
        $out = $this->getOutputFilename();
        $streams = collect($media->getStreams());
        $video = $streams->filter(fn($stream) => $stream->get('codec_type') === 'video')
            ->map(fn($stream) => $stream->get('index'))->values();
        $audio = $streams->filter(fn($stream) => $stream->get('codec_type') === 'audio')
            ->map(fn($stream) => $stream->get('index'))->values();
        $subtitle = $streams->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')
            ->map(fn($stream) => $stream->get('index'))->values();

        if ($this->clipStart) {
            $media->addFilter(static::getFromToFilter($this->clipStart, $this->clipEnd));
        }
        
        $export = $media->export();
        $export->onProgress(function ($percentage, $remaining, $rate) {
            FFMpegProcessEvent::dispatch('transcode.progress', $this->path, [
                'percentage' => $percentage,
                'remaining' => $remaining,
                'rate' => $rate,
            ]);
        })
        ->inFormat($format)
        ->beforeSaving(function ($commands) use ($video, $audio, $subtitle, $format) {

            $file = array_pop($commands[0]);
            $cmds = collect($commands[0]);
            $format instanceof h264_vaapi && $cmds = $format->stripOptions($cmds);
            $cmds = $cmds->replace([$cmds->search('-vcodec') => '-c:v', $cmds->search('-acodec') => '-c:a']);
            $subtitle->count() && $cmds = $this->addSubtitleCodec($cmds);
            $cmds = (new OutputMapper($this->streams, $video, $audio, $subtitle, $format))->execute($cmds);
            $cmds->push($file);
            return [$cmds->all()];
        })
        ->save($out);
    }

    public static function getFromToFilter(string $start, string $end): ClipFromToFilter
    {
        return new ClipFromToFilter(
            TimeCode::fromString($start),
            $end ? TimeCode::fromString($end) : null
        );
    }

    private function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s-transcode.mkv', $path, sha1($this->path));
    }

    private function addSubtitleCodec(Collection $cmds): Collection
    {
        $cmds->push('-c:s');
        $cmds->push('dvd_subtitle');
        return $cmds;
    }
}