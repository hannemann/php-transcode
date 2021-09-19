<?php

namespace App\Models\FFMpeg;

use Illuminate\Support\Collection;

class OutputMapper
{
    const MAP_CMD = '-map';
    const MAP_TEMPLATE = '%d:%s:%d';
    const TYPE_VIDEO = 'v';
    const TYPE_AUDIO = 'a';
    const TYPE_SUBTITLE = 's';

    public function __construct(array $codecConfig, Collection $video, Collection $audio, Collection $subtitle)
    {
        $this->streamIds = collect($codecConfig)->pluck('id')->all();
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;    
    }

    public function execute(Collection $cmds): Collection
    {
        $this->video->intersect($this->streamIds)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_VIDEO, $id));
        });
        $this->audio->intersect($this->streamIds)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_AUDIO, $id));
        });
        $this->subtitle->intersect($this->streamIds)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_SUBTITLE, $id));
        });
        return $cmds;
    }

    public function mapAll(Collection $cmds): Collection
    {
        $cmds->push('-map');
        $cmds->push('0:v?');
        $cmds->push('-map');
        $cmds->push('0:a?');
        $cmds->push('-map');
        $cmds->push('0:s?');
        return $cmds;
    }
}