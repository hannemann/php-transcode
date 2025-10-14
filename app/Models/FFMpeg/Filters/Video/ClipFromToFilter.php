<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Filters\Video\ClipFilter;
use FFMpeg\Media\Video;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\Format\VideoInterface;
use FFMpeg\Exception\InvalidArgumentException;

use App\Models\FFMpeg\Format\Video\h264_vaapi;

class ClipFromToFilter extends ClipFilter
{
    private ?TimeCode $to = null;

    public function __construct(TimeCode $start, TimeCode $to = null, $priority = 0)
    {
        if ($start->isAfter($to)) {
            throw new InvalidArgumentException(sprintf('Start timecode cannot be greater than end timecode'));
        }
        $this->start = $start;
        $this->to = $to;
        $this->priority = $priority;
    }

    public function getClippedDuration(float $duration): float
    {
        if ($this->to) {
            $duration = $this->to->toSeconds();
        }
        return $duration - $this->start->toSeconds();
    }

    /**
     * {@inheritdoc}
     */
    public function apply(Video $video, VideoInterface $format)
    {
        $commands = array('-ss', (string) $this->start);

        if ($this->to !== null) {
          $commands[] = '-to';
          $commands[] = (string) $this->to;
        }

        return $commands;
    }
}