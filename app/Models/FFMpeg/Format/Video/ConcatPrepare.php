<?php

namespace App\Models\FFMpeg\Format\Video;

use FFMpeg\Format\Video\DefaultVideo;
use Illuminate\Support\Collection;

class ConcatPrepare extends DefaultVideo
{

    public function __construct()
    {
        $this
            ->setAudioCodec('flac')
            ->setVideoCodec('copy');
    }

    public function getAvailableVideoCodecs()
    {
        return ['copy'];
    }

    public function getAvailableAudioCodecs()
    {
        return ['flac'];
    }

    public function getPasses()
    {
        return 1;
    }

    public function getAudioKiloBitrate()
    {
        return 384;
    }

    public function supportBFrames()
    {
        return true;
    }

    public function stripOptions(Collection $cmds): Collection
    {
        $cmds->splice($cmds->search('-threads'), 2);
        $cmds->splice($cmds->search('-b:v'), 2);
        $cmds->splice($cmds->search('-b:a'), 2);
        if (is_numeric($cmds->search('-refs'))) {
            $startIndex = $cmds->search('-refs');
            if ($endIndex = $cmds->search('-trellis')) {
                $endIndex += 2;
            } else {
                $endIndex = $cmds->count() - 1;
            }
            $cmds->splice($startIndex, $endIndex - $startIndex);
        }
        return $cmds;
    }
}