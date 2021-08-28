<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Filters\Video\ClipFilter;
use FFMpeg\Media\Video;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\Format\VideoInterface;

class ClipFromToFilter extends ClipFilter
{
    private ?string $to = null;

    public function __construct(TimeCode $start, TimeCode $to = null, $priority = 0)
    {
        $this->start = $start;
        $this->to = $to;
        $this->priority = $priority;
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