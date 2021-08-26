<?php

namespace App\Helper;


class File
{

    private static $fileSizeSuffix = [
        'Bytes', 'KB', 'MB', 'GB', 'TB'
    ];

    public static function fileSizeH(int $size, int $precision = 1): string
    {
        $base = 0;
        if ($size > 0) {
            $base = log($size) / log(1000);
            $size = round(pow(1000, $base - floor($base)), $precision);
        }
        return implode(' ', [$size, static::$fileSizeSuffix[floor($base)]]);
    }

}