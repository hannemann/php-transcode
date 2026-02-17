<?php

namespace App\Models\FFMpeg\Filters\Video;

class Pad
{
    const TEMPLATE_FILTER_PAD = 'pad=%d:%d:%d:%d';
    const DEFAULT_X = '(ow-iw)/2';
    const DEFAULT_Y = '(oh-ih)/2';

    public static function getFilterString(array $data): string
    {
        return sprintf(
            self::TEMPLATE_FILTER_PAD,
            $data['cw'],
            $data['ch'],
            $data['cx'] ?? self::DEFAULT_X,
            $data['cy'] ?? self::DEFAULT_Y,
        );
    }
}
