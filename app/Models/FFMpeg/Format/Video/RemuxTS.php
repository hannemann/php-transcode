<?php

namespace App\Models\FFMpeg\Format\Video;

use FFMpeg\Format\Video\DefaultVideo;
use Illuminate\Support\Collection;

class RemuxTS extends DefaultVideo
{

    public function __construct()
    {
        $this
            ->setAudioCodec('copy')
            ->setVideoCodec('copy');
    }

    public function getAvailableVideoCodecs()
    {
        return ['copy'];
    }

    public function getAvailableAudioCodecs()
    {
        return ['copy'];
    }

    public function supportBFrames()
    {
        return true;
    }

    public function getPasses()
    {
        return 1;
    }

    public function getAudioKiloBitrate()
    {
        return null;
    }

    public function stripOptions(Collection $cmds): Collection
    {
        $cmds->splice($cmds->search('-threads'), 2);
        if (is_numeric($cmds->search('-refs'))) {
            $cmds = $cmds->slice(0, $cmds->search('-refs'));
        }
        return $cmds;
    }
}