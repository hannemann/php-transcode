<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\ConcatPrepare as Format;
use App\Models\Video\File;
use Illuminate\Support\Collection;

class ConcatPrepare extends AbstractAction
{
    protected string $filenameAffix = 'prepare';
    protected string $filenameSuffix = 'mkv';

    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute()
    {
        $this->media = File::getMedia($this->disk, $this->path);
        $this->initStreams();
        $this->configureAudio();
        $this->codecMapper = new Helper\CodecMapper($this->codecConfig, $this->streams, $this->video, $this->audio, $this->subtitle);
        $this->codecMapper->forceCodec('copy', 'flac');
        $this->outputMapper = new Helper\OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
        $this->mediaExporter = $this->media->export();
        $this->export();
    }

    /**
     * update commands array
     */
    protected function updateCommands(array $commands): array
    {
        $file = array_pop($commands[0]);
        $cmds = collect($commands[0]);

        $cmds = $this->format->stripOptions($cmds);
        $cmds->push('-map', '0:v?');
        $cmds = $this->mapAudio($this->streams, $cmds, $this->codecConfig);
        $cmds->push('-map', '0:s?');
        $cmds = $this->codecMapper->execute($cmds);
        $cmds = $cmds->replace([$cmds->search('-c:v:0') => '-c:v']);
        $cmds->push('-c:s');
        $cmds->push('copy');

        $cmds->push($file);
        return [$cmds->all()];
    }

    private function configureAudio()
    {
        $audioCodecs = collect(config('transcode.audioCodecs'));
        $copyCodec = $audioCodecs->filter(fn($c, $key) => $key === 'copy')->first();
        $copyCodecId = $copyCodec->v;
        $config = collect($this->codecConfig);
        $this->audio->each(function ($stream) use ($config, $copyCodecId) {
            if (!$config->firstWhere('id', $stream)) {
                $config->push([
                    'id' => $stream,
                    'config' => [
                        'codec' => $copyCodecId
                    ]
                ]);
            }
        });
        $this->codecConfig = $config->sortBy('id')->all();
    }

    private function mapAudio(Collection $streams, Collection $cmds, array $config): Collection
    {
        $audioIndex = 0;
        $config = collect($config);
        $streams->map(function ($stream) use ($config, $cmds, &$audioIndex) {
            $hasConfig = $config->firstWhere('id', $stream->get('index'));
            switch ($stream->get('codec_type')) {
                case 'audio':
                    $cmds->push('-map');
                    $cmds->push(sprintf('0:a:%d', $audioIndex));
                    if (!$hasConfig) {
                        $cmds->push(sprintf('-c:a:%d', $audioIndex));
                        $cmds->push('copy');
                    }
                    $audioIndex++;
                    break;
            }
        });
        return $cmds;
    }
}