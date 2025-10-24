<?php

namespace App\Helper;

use Illuminate\Support\Facades\Storage;
use League\Flysystem\UnableToReadFile;
use App\Models\FFMpeg\Actions\RemovelogoCPU;

class Settings
{
    public static function decorateStreams(string $path, array $streams): array
    {
        $settings = static::getSettings($path);
        foreach($settings['streams'] as $streamSetting) {
            foreach($streams as $key => /* @var Stream */$stream) {
                if ($stream->get('index') === $streamSetting['id']) {
                    if ($stream->get('codec_type') === 'video') {
                        $streamSetting['config']['aspectRatio'] = $streamSetting['config']['aspectRatio'] ?? $stream->get('display_aspect_ratio');
                    }
                    $streams[$key]->set('transcodeConfig', $streamSetting['config']);
                    $streams[$key]->set('active', true);
                }
            }
        }
        return $streams;
    }

    public static function getSettings(string $path): array
    {
        try {
            if ($settings = Storage::disk('recordings')->get(static::getSettingsFilename($path))) {
                return json_decode($settings, true);
            }
            return ['clips' => [], 'streams' => []];
        } catch (UnableToReadFile $e) {
            return ['clips' => [], 'streams' => []];
        }
    }

    public static function save(string $path, array $data): void
    {
        $data['file'] = $path;
        $data['copy'] = [
            'clips' => "\n" . collect($data['clips'])->map(function ($clip) {
                return $clip['from'] . "\n" . $clip['to'];
            })->join("\n") . "\n",
        ];

        $hasRemoveLogo = collect($data['filterGraph'])->firstWhere('filterType', 'removeLogo');
        if (!$hasRemoveLogo) {
            RemovelogoCPU::deleteMasks($path);
        }

        $out = json_encode($data,  JSON_PRETTY_PRINT |  JSON_UNESCAPED_SLASHES);
        Storage::disk('recordings')->put(Settings::getSettingsFilename($path), $out, 'public');
    }

    public static function getSettingsFilename(string $path): string
    {
        return sprintf('%s.settings.json', $path);
    }
}