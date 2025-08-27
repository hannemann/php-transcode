<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Filters\Video\ComplexConcat;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Video\File;
use FFMpeg\Coordinate\TimeCode;

class Transcode extends AbstractAction
{
    protected string $filenameAffix = 'transcode';
    protected string $filenameSuffix = 'mkv';

    protected string $formatClass = h264_vaapi::class;

    /**
     * handle
     */
    public function execute()
    {
        $this->format->setConstantQuantizationParameter()
            ->setAudioCodec('copy');

        $this->media = File::getMedia($this->disk, $this->path);
        $this->duration = $this->media->getFormat()->get('duration');
        $this->initStreams();

        if (count($this->clips) === 1) {
            $this->media->addFilter(
                static::getFromToFilter($this->clips[0]['from'], $this->clips[0]['to'])
            );
        }

        $this->concatDemuxer = new Helper\ConcatDemuxer($this->disk, $this->path, $this->clips);
        $this->complexConcat = new ComplexConcat($this->codecConfig, $this->video, $this->audio, $this->subtitle, $this->clips);
        $this->codecMapper = new Helper\CodecMapper($this->codecConfig, $this->streams, $this->video, $this->audio, $this->subtitle);
        $this->outputMapper = new Helper\OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
        $this->clipDuration = $this->concatDemuxer->getDuration();
        $this->mediaExporter = $this->media->export();

        if ($this->format instanceof h264_vaapi) {
            $this->codecMapper->execute(collect([]));
            $this->codecMapper->resetIndices();
            $this->format->setAccelerationFramework(
                strpos($this->codecMapper->currentVideoCodec, 'nvenc') !== false ? 'cuda' : 'vaapi'
            );
        }

        $this->export();
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

    protected function calculateProgress(int $percentage): int
    {
        if ($this->duration !== $this->clipDuration && $percentage < 100) {
            $processed = $this->duration * $percentage / 100;
            $percentage = round(100 / $this->clipDuration * $processed);
        }
        return $percentage;
    }
}