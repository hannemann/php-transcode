<?php

namespace App\Helper;

use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use stdClass;

class Settings
{
    public static function decorateStreams(string $path, array $streams): array
    {
        $settings = static::getSettings($path);
        foreach($settings['streams'] as $streamSetting) {
            foreach($streams as $key => $stream) {
                if ($stream->get('index') === $streamSetting['id']) {
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
            $settings = Storage::disk('recordings')->get(static::getSettingsFilename($path));
            return json_decode($settings, true);
        } catch (FileNotFoundException $e) {
            return ['clips' => [], 'streams' => []];
        }
    }

    public static function getSettingsFilename(string $path): string
    {
        $path = rtrim(dirname($path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s.settings.json', $path, sha1($path));
    }
}