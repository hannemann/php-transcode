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

    public function __construct(array $streams, Collection $video, Collection $audio, Collection $subtitle)
    {
        $this->streams = $streams;
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;    
    }

    public function execute(Collection $cmds): Collection
    {
        $this->video->intersect($this->streams)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_VIDEO, $id));
        });
        $this->audio->intersect($this->streams)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_AUDIO, $id));
        });
        $this->subtitle->intersect($this->streams)->keys()->each(function($id) use (&$cmds) {
            $cmds->push(static::MAP_CMD);
            $cmds->push(sprintf(static::MAP_TEMPLATE, 0, static::TYPE_SUBTITLE, $id));
        });
        return $cmds;
    }
}