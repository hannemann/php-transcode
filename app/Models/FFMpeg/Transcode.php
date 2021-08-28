<?php

namespace App\Models\FFMpeg;

use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use App\Events\FFMpegProcess as FFMpegProcessEvent;
use App\Models\FFMpeg\Filters\Video\ClipFromToFilter;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use FFMpeg\Coordinate\TimeCode;

class Transcode
{
    public function __construct(string $disk, string $path, string $clipStart = null, string $clipEnd = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->clipStart = $clipStart;
        $this->clipEnd = $clipEnd;
    }

    public function execute()
    {
        $format = new h264_vaapi();
        $format->setConstantQuantizationParameter();
        $format->setAudioCodec('copy');
        $format->unsetAudioKiloBitrate();
        $out = $this->getOutputFilename();

        $media = FFMpeg::fromDisk($this->disk)->open($this->path);

        if ($this->clipStart) {

            $media->addFilter(
                new ClipFromToFilter(
                    TimeCode::fromString($this->clipStart),
                    $this->clipEnd ? TimeCode::fromString($this->clipEnd) : null
                )
            );
        }
        
        $media->export()
        ->onProgress(function ($percentage, $remaining, $rate) {
            FFMpegProcessEvent::dispatch('transcode.progress', $this->path, [
                'percentage' => $percentage,
                'remaining' => $remaining,
                'rate' => $rate,
            ]);
        })
        ->inFormat($format)
        ->save($out);
    }

    private function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s-transcode.mkv', $path, sha1($this->path));
    }
}