<?php

namespace App\Models\FFMpeg\Filters\Video;

class Crop
{
    const TEMPLATE_FILTER_CROP = 'crop=%d:%d:%d:%d';

    public static function getFilterString(array $data): string
    {
        return sprintf(
            self::TEMPLATE_FILTER_CROP,
            $data['cw'],
            $data['ch'],
            $data['cx'],
            $data['cy'],
        );
    }
}
