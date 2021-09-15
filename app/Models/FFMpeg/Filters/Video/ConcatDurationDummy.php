<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Filters\Video\ClipFilter;
use FFMpeg\Format\VideoInterface;
use FFMpeg\Media\Video;

class ConcatDurationDummy extends ClipFilter
{
    /**
     * {@inheritdoc}
     */
    public function apply(Video $video, VideoInterface $format)
    {
        return [];
    }
}