<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Coordinate\TimeCode;
use App\Models\FFMpeg\Format\Video\h264_vaapi;
use Illuminate\Support\Collection;

class ComplexConcat
{
    private array $streamIds;
    private Collection $video;
    private Collection $audio;
    private Collection $subtitle;
    private array $clips;

    public function __construct(array $codecConfig, Collection $video, Collection $audio, Collection $subtitle, array $clips = [])
    {
        $this->streamIds = collect($codecConfig)->pluck('id')->all();
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;
        $this->clips = $clips;
    }

    public function isActive(): bool
    {
        return count($this->clips) > 1;
    }

    public function getFilter(Collection $cmds, h264_vaapi $format, string $disk, string $path): Collection
    {

        $tmplVideoFilter = '[0:v:%d]%s,split=%d%s';
        $tmplVideo = '[%s]trim=%f:%f,setpts=PTS-STARTPTS[v%d]';
        $tmplAudio = '[0:a:%d]atrim=%f:%f,asetpts=PTS-STARTPTS[a%d]';
        $tmplSubtitle = '[0:s:%d]atrim=%f:%f,asetpts=PTS-STARTPTS[s%d]';

        $isHw = $format && $format instanceof h264_vaapi && $format->accelerationFramework;

        $filters = collect([]);
        $filterGraph = (string)new FilterGraph($disk, $path);
        if ($filterGraph) {
            $filters->push($filterGraph);
        }

        $hasFilters = $filters->isNotEmpty();
        $items = [];
        $streamIds = $this->getStreamIds();

        $filterInputs = collect($this->clips)->keys()->map(function(int $key) use ($streamIds) {
            return collect($streamIds['video'])->map(function(int $id) use ($key) {
                return '[filter_v_' . $key . '_' . $id . ']';
            })->join('');
        })->join('');

        foreach($streamIds['video'] as $id) {
            $items[] = sprintf($tmplVideoFilter, $id, $filters->join(','), count($this->clips) * count($streamIds['video']), $filterInputs);
        }

        $parts = [];
        $n = 0;
        foreach($this->clips as $key => $clip) {

            $from = TimeCode::fromString($clip['from'])->toSeconds() + (float)('0' . substr($clip['from'], strpos($clip['from'], '.')));
            $to = TimeCode::fromString($clip['to'])->toSeconds() + (float)('0' . substr($clip['to'], strpos($clip['to'], '.')));

            foreach($streamIds['video'] as $id) {
                $streamInId = ($hasFilters ? 'filter_v_' . $key . '_' : '0:v:') . $id;
                $items[] = sprintf($tmplVideo, $streamInId, $from, $to, $n);
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
        $last .= $isHw ? '[concat]' : '[out]';
        $items[] = $last;

        if ($isHw) {
            $items[] = '[concat]format=nv12,hwupload[out]';
        }

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

        $this->video->intersect($this->streamIds)->keys()->each(function($id) use (&$streams) {
            $streams['video'][] = $id;
        });
        $this->audio->intersect($this->streamIds)->keys()->each(function($id) use (&$streams) {
            $streams['audio'][] = $id;
        });
        $this->subtitle->intersect($this->streamIds)->keys()->each(function($id) use (&$streams) {
            $streams['subtitle'][] = $id;
        });
        return $streams;
    }
}