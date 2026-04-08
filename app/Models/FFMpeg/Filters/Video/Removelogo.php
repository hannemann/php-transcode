<?php

namespace App\Models\FFMpeg\Filters\Video;

use App\Models\FFMpeg\Actions\Helper\VTime;
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

    public static function getFilterString(string $bitmap, array $data, ?string $atTimestamp = ''): string
    {
        $filter = collect([]);
        $filter->push(sprintf(
            self::TEMPLATE_FILTER,
            escapeshellarg(addcslashes($bitmap, "',:\\"))
        ));

        if ($data['between']['from'] && $data['between']['to']) {
            $from = (float) $data['between']['from'];
            $to = (float) $data['between']['to'];

            if ($atTimestamp) {
                $atSeconds = collect(explode(':', $atTimestamp))
                    ->reduce(VTime::reduceCoord(...), 0);

                $from = max(0, $from - $atSeconds);
                $to = max(0, $to - $atSeconds);
            }
            $filter->push(sprintf(self::TEMPLATE_ENABLE, $from, $to));
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

    public static function deleteMask(string $path, string $fileId): void
    {

        $glob = implode(
            DIRECTORY_SEPARATOR,
            [
                config('filesystems.disks.recordings.root'),
                dirname($path),
                $fileId . '.logomask.png'
            ]
        );
        FileFacade::delete(FileFacade::glob($glob));
    }
}
