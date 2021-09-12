<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Video\File;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Collection;
use App\Models\CurrentQueue;

class Transcode
{
    public function __construct(string $disk, string $path, array $streams, int $current_queue_id, array $clips = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->streams = $streams;
        $this->clips = $clips;
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

        $streams = collect($media->getStreams());
        $video = $streams->filter(fn($stream) => $stream->get('codec_type') === 'video')
            ->map(fn($stream) => $stream->get('index'))->values();
        $audio = $streams->filter(fn($stream) => $stream->get('codec_type') === 'audio')
            ->map(fn($stream) => $stream->get('index'))->values();
        $subtitle = $streams->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')
            ->map(fn($stream) => $stream->get('index'))->values();

        if (count($this->clips) === 1) {
            $clipFilter = static::getFromToFilter($this->clips[0]['from'], $this->clips[0]['to']);
            $clipDuration = $clipFilter->getClippedDuration($clipDuration);
            $media->addFilter($clipFilter);
        }
        
        $concatDemuxer = null;
        if (count($this->clips) > 1) {
            $concatDemuxer = new ConcatDemuxer($this->disk, $this->path, $this->clips);
            $clipDuration = $concatDemuxer->getDuration();
            $format->setAudioCodec('ac3');
            $format->setAudioKiloBitrate(384);
        }
        
        $media->export()
        ->onProgress(function ($percentage, $remaining, $rate) use ($duration, $clipDuration) {

            if ($duration !== $clipDuration && $percentage < 100) {
                $processed = $duration * $percentage / 100;
                $percentage = round(100 / $clipDuration * $processed);
            }

            CurrentQueue::where('id', $this->current_queue_id)->update(['percentage' => $percentage]);
        })
        ->inFormat($format)
        ->beforeSaving(function ($commands) use ($video, $audio, $subtitle, $format, $concatDemuxer) {

            $file = array_pop($commands[0]);
            $cmds = collect($commands[0]);
            $format instanceof h264_vaapi && $cmds = $format->stripOptions($cmds);
            $cmds = $cmds->replace([$cmds->search('-vcodec') => '-c:v', $cmds->search('-acodec') => '-c:a']);
            $subtitle->count() && $cmds = $this->addSubtitleCodec($cmds);
            $cmds = (new OutputMapper($this->streams, $video, $audio, $subtitle, $format))->execute($cmds);

            if ($concatDemuxer) {
                $cmds = $concatDemuxer->addCommands($cmds);
                $concatDemuxInput = $concatDemuxer->getInputFilename(true);
                $cmds = $cmds->replace([$cmds->search('-i') + 1 => $concatDemuxInput]);
            }
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