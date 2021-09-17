<?php

namespace App\Models\FFMpeg;

use Illuminate\Support\Collection;

/**
 * @property Collection $cmds
 * @property Collection $streamConfig
 * @property int[] $wantedStreams
 * @property Collection $video
 * @property Collection $audio
 * @property Collection $subtitle
 * @property Collection $videoCodecs
 * @property Collection $audioCodecs
 */
class CodecMapper
{
    public function __construct(Collection $cmds, Collection $streams, array $streamConfig, Collection $video, Collection $audio, Collection $subtitle) {
        $this->cmds = $cmds;
        $this->streams = $streams;
        $this->streamConfig = $streamConfig;
        $this->wantedStreams = collect($this->streamConfig)->pluck('id')->all();
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;
        $this->videoCodecs = collect(config('transcode.videoCodecs'));
        $this->audioCodecs = collect(config('transcode.audioCodecs'));
    }

    public function execute(): Collection
    {
        $this->cleanCommands();
        foreach($this->streamConfig as $stream) {
            $type = $this->streams->filter(function ($item) use ($stream) {
                return $item->get('index') == $stream['id'];
            })->first()->get('codec_type');
            if ($type === 'video') {
                $this->cmds = $this->getVideoCodecConfig($this->cmds, $stream);
            }
            if ($type === 'audio') {
                $this->cmds = $this->getAudioCodecConfic($this->cmds, $stream);
            }
            if ($type === 'subtitle') {
                $streamId = $this->subtitle->intersect([$stream['id']])->keys()->first();
                $this->cmds->push('-c:s:' . $streamId);
                $this->cmds->push('dvd_subtitle');
            }
        }

        return $this->cmds;
    }

    private function cleanCommands(): static
    {
        $this->cmds->splice($this->cmds->search('-vcodec'), 2);
        $this->cmds->splice($this->cmds->search('-acodec'), 2);
        return $this;
    }

    private function getVideoCodecConfig(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->video->intersect([$stream['id']])->keys()->first();
        $cmds->push('-c:v:' . $streamId);
        if (isset($stream['config']['codec'])) {
            $codec = $this->videoCodecs->filter(fn($c) => (int)$c->v === (int)$stream['config']['codec'])->keys()->first();
        } else {
            $codec = $this->getDefaultCodecName($this->videoCodecs);
        }
        $cmds->push($codec);
        $cmds->push('-qp:' . $streamId);
        $cmds->push($stream['config']['qp'] ?? $this->getDefaultCodec($this->videoCodecs)->qp);
        return $cmds;
    }

    private function getAudioCodecConfic(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->audio->intersect([$stream['id']])->keys()->first();
        $cmds->push('-c:a:' . $streamId);
        if (isset($stream['config']['codec'])) {
            $codec = $this->audioCodecs->filter(fn($c) => (int)$c->v === (int)$stream['config']['codec'])->keys()->first();
        } else {
            $codec = $this->getDefaultCodecName($this->audioCodecs);
        }
        $channels = $stream['config']['channels'] ?? $this->getDefaultCodec($this->audioCodecs)->channels;
        $cmds->push($codec);
        $cmds->push('-b:a:' . $streamId);
        $cmds->push(($channels / 2) * $this->audioCodecs[$codec]->bitrate . 'k');
        $cmds->push('-ac:' . $streamId);
        $cmds->push($channels);
        return $cmds;
    }

    private function getDefaultCodec(Collection $codecs): \stdClass
    {
        return $codecs->filter(fn($c) => $c->default ?? false)->first();
    }

    private function getDefaultCodecName(Collection $codecs): string
    {
        return $codecs->filter(fn($c) => $c->default ?? false)->keys()->first();
    }
}