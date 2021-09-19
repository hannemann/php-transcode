<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Filters\Video\ComplexConcat;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Video\File;
use FFMpeg\Coordinate\TimeCode;
use App\Models\CurrentQueue;

class Transcode
{
    protected string $filenameAffix = 'transcode';
    protected string $filenameSuffix = 'mkv';

    protected string $formatClass = h264_vaapi::class;

    public function __construct(string $disk, string $path, int $current_queue_id, array $codecConfig = [], array $clips = [])
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->current_queue_id = $current_queue_id;
        $this->format = new $this->formatClass();
        $this->codecConfig = $codecConfig;
        $this->clips = $clips;
    }

    /**
     * handle
     */
    public function execute()
    {
        $this->format->setConstantQuantizationParameter();
        $this->format->setAudioCodec('copy');
        $this->format->unsetAudioKiloBitrate();

        $this->media = File::getMedia($this->disk, $this->path);
        $this->duration = $this->media->getFormat()->get('duration');
        $this->initStreams();


        if (count($this->clips) === 1) {
            $this->media->addFilter(
                static::getFromToFilter($this->clips[0]['from'], $this->clips[0]['to'])
            );
        }

        $this->concatDemuxer = new ConcatDemuxer($this->disk, $this->path, $this->clips);
        $this->complexConcat = new ComplexConcat($this->codecConfig, $this->video, $this->audio, $this->subtitle, $this->clips);
        $this->codecMapper = new CodecMapper($this->codecConfig, $this->streams, $this->video, $this->audio, $this->subtitle);
        $this->outputMapper = new OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
        $this->clipDuration = $this->concatDemuxer->getDuration();
        $this->export();
    }

    /**
     * export file
     */
    protected function export(): void
    {
        $this->media->export()
            ->onProgress(\Closure::fromCallable([$this, 'saveProgress']))
            ->inFormat($this->format)
            ->beforeSaving(\Closure::fromCallable([$this, 'updateCommands']))
            ->save($this->getOutputFilename());
    }

    /**
     * obtain from to filter
     */
    public static function getFromToFilter(string $start, string $end): ClipFromToFilter
    {
        return new ClipFromToFilter(
            TimeCode::fromString($start),
            $end ? TimeCode::fromString($end) : null
        );
    }

    /**
     * obtain output filename
     */
    public function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf(
            '%s%s.%s.%s',
            $path,
            sha1($this->path),
            $this->filenameAffix,
            $this->filenameSuffix
        );
    }

    /**
     * initialize stream collections
     */
    protected function initStreams(): void
    {
        $this->streams = collect($this->media->getStreams());
        $this->video = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'video')
            ->map(fn($stream) => $stream->get('index'))->values();
        $this->audio = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'audio')
            ->map(fn($stream) => $stream->get('index'))->values();
        $this->subtitle = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')
            ->map(fn($stream) => $stream->get('index'))->values();
    }

    /**
     * update commands array
     */
    protected function updateCommands(array $commands): array
    {
        $file = array_pop($commands[0]);
        $cmds = collect($commands[0]);

        $this->format instanceof h264_vaapi && $cmds = $this->format->stripOptions($cmds);
        $cmds = $this->codecMapper->execute($cmds);

        if ($this->concatDemuxer->isActive()) {
            $cmds = $this->concatDemuxer->addCommands($cmds);
        }
        if ($this->complexConcat->isActive()) {
            $cmds = $this->complexConcat->getFilter($cmds);
        } else {
            $cmds = $this->outputMapper->execute($cmds);
        }

        $cmds->push($file);
        return [$cmds->all()];
    }

    /**
     * calculate progress and update queue
     */
    protected function saveProgress($percentage, $remaining, $rate): void {

        if ($this->duration !== $this->clipDuration && $percentage < 100) {
            $processed = $this->duration * $percentage / 100;
            $percentage = round(100 / $this->clipDuration * $processed);
        }

        CurrentQueue::where('id', $this->current_queue_id)->update([
            'percentage' => $percentage,
            'remaining' => $remaining,
            'rate' => $rate,
        ]);
    }
}