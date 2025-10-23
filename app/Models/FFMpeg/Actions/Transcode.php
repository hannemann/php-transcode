<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Filters\Video\ComplexConcat;
use App\Models\FFMpeg\Filters\Video\FilterGraph;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use App\Models\Video\File;
use FFMpeg\Coordinate\TimeCode;

/**
 * @property h264_vaapi $format
 */
class Transcode extends AbstractAction
{
    protected string $filenameAffix = 'transcode';
    protected string $filenameSuffix = 'mkv';

    protected Helper\ConcatDemuxer $concatDemuxer;
    protected ComplexConcat $complexConcat;
    protected float $duration;
    protected float $clipDuration;

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

        $isSingleClip = count($this->clips) <= 1;

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

        $filters = collect([]);

        if ($isSingleClip) {
            $filterGraph = (string)new FilterGraph($this->disk, $this->path);
            if ($filterGraph) {
                $filters->push($filterGraph);
            }
        }

        if ($this->format instanceof h264_vaapi) {
            $this->codecMapper->execute(collect([]));
            $this->codecMapper->resetIndices();
            
            if (strpos($this->codecMapper->currentVideoCodec, 'nvenc') !== false) {
                $this->format->setAccelerationFramework(h264_vaapi::ACCEL_CUDA);
            }
            
            if (strpos($this->codecMapper->currentVideoCodec, 'vaapi') !== false) {
                $this->format->setAccelerationFramework(h264_vaapi::ACCEL_VAAPI);
            }

            if ($this->format->getAccelerationFramework() && $isSingleClip) {
                $filters->push('format=nv12');
                $filters->push('hwupload');
            }
        }

        if ($filters->isNotEmpty()) {
            $this->media->addFilter(['-filter:v', $filters->join(',')]);
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
            $cmds = $this->complexConcat->getFilter($cmds, $this->format, $this->disk, $this->path);
        } else {
            $cmds = $this->outputMapper->execute($cmds);
        }

        $cmds->push($file);
        return [$cmds->all()];
    }

    protected function calculateProgress(int $percentage): int
    {
        if (count($this->clips) > 0 && $this->duration !== $this->clipDuration && $percentage < 100) {
            $processed = $this->duration * $percentage / 100;
            $percentage = round(100 / $this->clipDuration * $processed);
        }
        return $percentage;
    }
}