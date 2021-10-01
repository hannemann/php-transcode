<?php

namespace App\Models\FFMpeg\Format\Video;

use FFMpeg\Format\Video\DefaultVideo;
use Illuminate\Support\Collection;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;

class Scale extends DefaultVideo
{

    public function __construct()
    {
        $this
            ->setAudioCodec('copy')
            ->setVideoCodec('libx264');
    }

    public function getAvailableVideoCodecs()
    {
        return ['libx264'];
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
        $cmds = Libx264Options::strip($cmds);
        $cmds->splice($cmds->search('-acodec'), 2);
        $cmds->splice($cmds->search('-vcodec'), 2);
        $cmds->splice($cmds->search('-b:v'), 2);
        return $cmds;
    }
}