<?php

namespace App\Models\FFMpeg\Actions\Helper;

use Illuminate\Support\Collection;
use FFMpeg\FFProbe\DataMapping\Stream;

/**
 * @property Collection $cmds
 * @property Collection $codecConfig
 * @property Collection<Stream> $streams
 * @property int[] $wantedStreams
 */
class RemuxMapper
{

    private $videoIndex = 0;

    public function __construct(array $codecConfig, Collection $streams) {
        $this->codecConfig = $codecConfig;
        $this->wantedStreams = collect($this->codecConfig)->pluck('id')->all();
        $this->streams = $streams;
    }

    public function execute(Collection $cmds): Collection
    {
        $this->cmds = $cmds;
        foreach($this->codecConfig as $stream) {
            $type = $this->streams->filter(function ($item) use ($stream) {
                return $item->get('index') == $stream['id'];
            })->first()->get('codec_type');
            if ($type === 'video') {
                $this->cmds = $this->getVideoCodecConfig($this->cmds, $stream);
            }
        }

        return $this->cmds;
    }

    private function getVideoCodecConfig(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->videoIndex;
        $this->videoIndex++;
        if (($stream['config']['aspectRatio'] ?? 'Keep') !== 'Keep') {
            $cmds->push('-aspect:v:' . $streamId);
            $cmds->push($stream['config']['aspectRatio']);
        }
        return $cmds;
    }
}