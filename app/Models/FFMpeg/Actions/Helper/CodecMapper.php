<?php

namespace App\Models\FFMpeg\Actions\Helper;

use Illuminate\Support\Collection;

/**
 * @property Collection $cmds
 * @property Collection $codecConfig
 * @property int[] $wantedStreams
 * @property Collection $video
 * @property Collection $audio
 * @property Collection $subtitle
 * @property Collection $videoCodecs
 * @property Collection $audioCodecs
 */
class CodecMapper
{
    private ?string $forcedVideoCodec = null;
    private ?string $forcedAudioCodec = null;
    private ?string $forcedSubtitleCodec = null;

    private $videoIndex = 0;
    private $audioIndex = 0;
    private $subtitleIndex = 0;

    public function __construct(array $codecConfig, Collection $streams, Collection $video, Collection $audio, Collection $subtitle) {
        $this->codecConfig = $codecConfig;
        $this->wantedStreams = collect($this->codecConfig)->pluck('id')->all();
        $this->streams = $streams;
        $this->video = $video;
        $this->audio = $audio;
        $this->subtitle = $subtitle;
        $this->videoCodecs = collect(config('transcode.videoCodecs'));
        $this->audioCodecs = collect(config('transcode.audioCodecs'));
    }

    public function execute(Collection $cmds): Collection
    {
        $this->cmds = $cmds;
        $this->cleanCommands();
        foreach($this->codecConfig as $stream) {
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
                $this->cmds = $this->getSubtileCodecConfic($this->cmds, $stream);
            }
        }

        return $this->cmds;
    }

    public function forceCodec($video = null, $audio = null, $subtitle = null): void
    {
        $this->forcedVideoCodec = $video;
        $this->forcedAudioCodec = $audio;
        $this->forcedSubtitleCodec = $subtitle;
    }

    private function cleanCommands(): static
    {
        $commands = ['-vcodec', '-acodec', '-qp'];
        foreach($commands as $command) {
            if ($index = $this->cmds->search($command)) {
                $this->cmds->splice($index, 2);
            }
        }
        return $this;
    }

    private function getVideoCodecConfig(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->videoIndex;
        $this->videoIndex++;
        $cmds->push('-c:v:' . $streamId);
        if ($this->forcedVideoCodec) {
            $codec = $this->forcedVideoCodec;
        } elseif (isset($stream['config']['codec'])) {
            $codec = $this->videoCodecs->filter(fn($c) => (int)$c->v === (int)$stream['config']['codec'])->keys()->first();
        } else {
            $codec = $this->getDefaultCodecName($this->videoCodecs);
        }
        $cmds->push($codec);
        if ($codec !== 'copy') {
            $cmds->push('-qp:v:' . $streamId);
            $cmds->push($stream['config']['qp'] ?? $this->getDefaultCodec($this->videoCodecs)->qp);
        }
        $cmds->push('-aspect:v:' . $streamId);
        $cmds->push($stream['config']['aspectRatio'] ?? '16:9');
        return $cmds;
    }

    private function getAudioCodecConfic(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->audioIndex;
        $this->audioIndex++;
        $cmds->push('-c:a:' . $streamId);
        if ($this->forcedAudioCodec) {
            $codec = $this->forcedAudioCodec;
        } elseif (isset($stream['config']['codec'])) {
            $codec = $this->audioCodecs->filter(fn($c) => (int)$c->v === (int)$stream['config']['codec'])->keys()->first();
        } else {
            $codec = $this->getDefaultCodecName($this->audioCodecs);
        }
        $channels = $stream['config']['channels'] ?? $this->getDefaultCodec($this->audioCodecs)->channels;
        $cmds->push($codec);
        if ($codec !== 'copy') {
            if ($codec !== 'flac') {
                $cmds->push('-b:a:' . $streamId);
                $cmds->push(($channels / 2) * $this->audioCodecs[$codec]->bitrate . 'k');
            }
            $cmds->push('-ac:a:' . $streamId);
            $cmds->push($channels);
        }
        return $cmds;
    }

    private function getSubtileCodecConfic(Collection $cmds, array $stream): Collection
    {
        $streamId = $this->subtitleIndex;
        $this->subtitleIndex++;
        $this->cmds->push('-c:s:' . $streamId);
        $this->cmds->push($this->forcedSubtitleCodec ?? 'dvd_subtitle');
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