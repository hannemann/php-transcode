<?php

namespace App\Models\FFMpeg\Actions\Helper;

use Symfony\Component\Process\Process;

class Hardware
{
    public static function supportsCuda()
    {
        $command = [
            config('laravel-ffmpeg.ffmpeg.binaries'),
            '-hide_banner',
            '-hwaccel',
            'cuda',
            '-f',
            'lavfi',
            '-i',
            'color=c=black:s=640x480',
            '-c:v',
            'h264_nvenc',
            '-t',
            '1',
            '-f',
            'null',
            '-'
        ];

        return self::getProcessSuccess($command);
    }

    public static function supportsVaapi()
    {
        $command = [
            config('laravel-ffmpeg.ffmpeg.binaries'),
            '-hide_banner',
            '-vaapi_device',
            config('transcode.vaapiDevice'),
            '-f',
            'lavfi',
            '-i',
            'color=c=black:s=640x480',
            '-filter:v',
            'format=nv12,hwupload',
            '-c:v',
            'h264_vaapi',
            '-t',
            '1',
            '-f',
            'null',
            '-'
        ];

        return self::getProcessSuccess($command);
    }

    private static function getProcessSuccess(array $command): bool
    {
        $process = new Process($command);

        $process->setTimeout(10);
        $process->run();

        return $process->isSuccessful();
    }
}
