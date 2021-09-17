<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Collection;

class ComplexConcat
{
    public function __construct(array $clips, array $streams, Collection $video, Collection $audio, Collection $subtitle)
    {
        $this->clips = $clips;
        $this->streams = collect($streams)->pluck('id')->all();
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;
    }

    public function getFilter(Collection $cmds): Collection
    {

        $tmplVideo = '[0:v:%d]trim=%f:%f,setpts=PTS-STARTPTS[v%d]';
        $tmplAudio = '[0:a:%d]atrim=%f:%f,asetpts=PTS-STARTPTS[a%d]';
        $tmplSubtitle = '[0:s:%d]atrim=%f:%f,asetpts=PTS-STARTPTS[s%d]';

        $streamIds = $this->getStreamIds();

        $items = [];
        $parts = [];
        $n = 0;
        foreach($this->clips as $key => $clip) {

            $from = TimeCode::fromString($clip['from'])->toSeconds() + (float)('0' . substr($clip['from'], strpos($clip['from'], '.')));
            $to = TimeCode::fromString($clip['to'])->toSeconds() + (float)('0' . substr($clip['to'], strpos($clip['to'], '.')));

            foreach($streamIds['video'] as $id) {
                $items[] = sprintf($tmplVideo, $id, $from, $to, $n);
                $parts[] = sprintf('[v%d]', $n);
            }
            foreach($streamIds['audio'] as $id) {
                $items[] = sprintf($tmplAudio, $id, $from, $to, $n);
                $parts[] = sprintf('[a%d]', $n);
            }
            foreach($streamIds['subtitle'] as $id) {
                $items[] = sprintf($tmplSubtitle, $id, $from, $to, $n);
                $parts[] = sprintf('[s%d]', $n);
            }
            $n++;
        }

        $last = implode('', $parts) . sprintf('concat=n=%d', $n);

        if (!empty($streamIds['video'])) {
            $last .= sprintf(':v=%d', count($streamIds['video']));
        }
        if (!empty($streamIds['audio'])) {
            $last .= sprintf(':a=%d', count($streamIds['audio']));
        }
        if (!empty($streamIds['subtitle'])) {
            $last .= sprintf(':s=%d', count($streamIds['subtitle']));
        }
        $last .= '[out]';
        $items[] = $last;
        $filter = implode(';', $items);

        $cmds[] = '-filter_complex';
        $cmds[] = $filter;
        $cmds[] = '-map';
        $cmds[] = '[out]';

        return $cmds;

    }

    private function getStreamIds(): array
    {
        $streams = [
            'video' => [],
            'audio' => [],
            'subtitle' => [],
        ];

        $this->video->intersect($this->streams)->keys()->each(function($id) use (&$streams) {
            $streams['video'][] = $id;
        });
        $this->audio->intersect($this->streams)->keys()->each(function($id) use (&$streams) {
            $streams['audio'][] = $id;
        });
        $this->subtitle->intersect($this->streams)->keys()->each(function($id) use (&$streams) {
            $streams['subtitle'][] = $id;
        });
        return $streams;
    }
}