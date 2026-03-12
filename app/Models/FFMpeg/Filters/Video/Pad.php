<?php

namespace App\Models\FFMpeg\Filters\Video;

use Illuminate\Support\Str;

class Pad
{
    const TEMPLATE_FILTER_PAD = 'pad=%d:%d:%d:%d:color=%s';
    const DEFAULT_X = '(ow-iw)/2';
    const DEFAULT_Y = '(oh-ih)/2';
    const DEFAULT_COLOR = 'black';

    public static function getFilterString(array $data): string
    {
        $color = $data['color'] ?? self::DEFAULT_COLOR;

        return sprintf(
            self::TEMPLATE_FILTER_PAD,
            $data['cw'],
            $data['ch'],
            $data['cx'] ?? self::DEFAULT_X,
            $data['cy'] ?? self::DEFAULT_Y,
            Str::replace('#', '0x', $color)
        );
    }
}
