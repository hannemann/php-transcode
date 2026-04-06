<?php

namespace App\Models\FFMpeg\Actions\Helper;

class VTime
{
    public static function reduceCoord($carry, $item, $key): float
    {
        return $carry + (
            $key === 0
            ? (int)$item * 60 * 60
            : (
                $key === 1
                ? ((int)$item * 60)
                : ((float)$item)
            )
        );
    }
}
