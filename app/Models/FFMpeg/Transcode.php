<?php

namespace App\Models\FFMpeg;

use App\Events\FFMpegProgress as FFMpegProgressEvent;
use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Video\File;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Collection;
use App\Models\CurrentQueue;

class Transcode
{
    public function __construct(string $disk, string $path, array $streams, int $current_queue_id, string $clipStart = null, string $clipEnd = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->streams = $streams;
        $this->clipStart = $clipStart;
        $this->clipEnd = $clipEnd;
        $this->current_queue_id = $current_queue_id;
    }

    public function execute()
    {
        $format = new h264_vaapi();
        $format->setConstantQuantizationParameter();
        $format->setAudioCodec('copy');
        $format->unsetAudioKiloBitrate();
        $out = $this->getOutputFilename();

        $media = File::getMedia($this->disk, $this->path);

        $videoFormat = $media->getFormat();
        $duration = $videoFormat->get('duration');
        $clipDuration = $duration;

        $out = $this->getOutputFilename();
        $streams = collect($media->getStreams());
        $video = $streams->filter(fn($stream) => $stream->get('codec_type') === 'video')
            ->map(fn($stream) => $stream->get('index'))->values();
        $audio = $streams->filter(fn($stream) => $stream->get('codec_type') === 'audio')
            ->map(fn($stream) => $stream->get('index'))->values();
        $subtitle = $streams->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')
            ->map(fn($stream) => $stream->get('index'))->values();

        if ($this->clipStart) {
            $clipFilter = static::getFromToFilter($this->clipStart, $this->clipEnd);
            $clipDuration = $clipFilter->getClippedDuration($clipDuration);
            $media->addFilter($clipFilter);
        }
        
        $media->export()
        ->onProgress(function ($percentage, $remaining, $rate) use ($duration, $clipDuration) {

            if ($duration !== $clipDuration && $percentage < 100) {
                $processed = $duration * $percentage / 100;
                $percentage = round(100 / $clipDuration * $processed);
            }

            CurrentQueue::where('id', $this->current_queue_id)->update(['percentage' => $percentage]);
            // FFMpegProgressEvent::dispatch('transcode.progress', $this->path, [
            //     'percentage' => $percentage,
            //     'remaining' => $remaining,
            //     'rate' => $rate,
            //     'queue' => CurrentQueue::all(),
            // ]);
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