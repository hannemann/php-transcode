<?php

namespace App\Models\FFMpeg\Filters\Video;

class Scale
{
    const TEMPLATE_FILTER_PAD = 'scale=%d:%d';

    public static function getFilterString(int $width, int $height): string
    {
        return sprintf(
            self::TEMPLATE_FILTER_PAD,
            $width,
            $height
        );
    }
}
