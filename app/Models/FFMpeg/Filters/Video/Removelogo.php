<?php

namespace App\Models\FFMpeg\Filters\Video;

use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File as FileFacade;

class Removelogo
{
    const TEMPLATE_FILTER = 'removelogo=filename=%s';
    const TEMPLATE_ENABLE = 'enable=\'between(t,%f,%f)\'';

    public static function getBitMap(string $disk, string $path, string $timestamp, string $w, string $h, $fileId, ?string $withFilters = ''): string
    {
        $customMask = self::getCustomMaskPath($path, $fileId);

        if (self::hasCustomMask($customMask)) {
            return sprintf(
                '%s/%s',
                config('filesystems.disks.' . $disk . '.root'),
                $customMask
            );
        } else {
            return Image::createLogoMask(
                $disk,
                $path,
                $timestamp,
                $fileId,
                $w,
                $h,
                $withFilters
            );
        }
    }

    public static function getFilterString(string $bitmap, array $data): string
    {
        $filter = collect([]);
        $filter->push(sprintf(
            self::TEMPLATE_FILTER,
            escapeshellarg(addcslashes($bitmap, "',:\\"))
        ));

        if ($data['between']['from'] && $data['between']['to']) {
            $filter->push(sprintf(self::TEMPLATE_ENABLE, $data['between']['from'], $data['between']['to']));
        }

        return $filter->join(':');
    }

    public static function getCustomMaskPath(string $path, string $fileId): string
    {
        return sprintf(
            '%s%s%s',
            dirname($path),
            DIRECTORY_SEPARATOR,
            $fileId . '.logomask.png'
        );
    }

    public static function hasCustomMask(string $path): bool
    {
        return Storage::disk('recordings')->exists($path);
    }

    public static function deleteMasks(string $path): void
    {

        $glob = implode(
            DIRECTORY_SEPARATOR,
            [
                config('filesystems.disks.recordings.root'),
                dirname($path),
                '*logomask.png'
            ]
        );
        FileFacade::delete(FileFacade::glob($glob));
    }
}
