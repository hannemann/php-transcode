<?php

namespace App\Models;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Helper\File as FileHelper;

class FilePicker
{
    /**
     * obtain all items of a subdirectory
     */
    public static function getItems(string $subdir = null, bool $hidden = false): Collection
    {
        $d = static::getDirectories($subdir, $hidden)->map([static::class, 'getDirectoryData']);
        $f = static::getFiles($subdir, $hidden)->map([static::class, 'getFileData']);
        return $d->merge($f);
    }

    /**
     * obtain directory data
     */
    public static function getDirectoryData(string $item): array
    {
        return array_merge(static::getBaseData($item), ['type' => 'd',]);
    }

    /**
     * obtain file data
     */
    public static function getFileData(string $item): array
    {
        return array_merge(
            static::getBaseData($item),
            [
                'type' => 'f',
                'mime' => Storage::disk('recordings')->mimeType($item),
                'size' => FileHelper::fileSizeH((int)Storage::disk('recordings')->size($item)),
                'lastModified' => Storage::disk('recordings')->lastModified($item),
            ]
        );
    }

    /**
     * obtain base data
     */
    private static function getBaseData(string $item): array
    {
        return [
            'name' => basename($item),
            'path' => $item,
            'channel' => sha1($item)
        ];
    }

    /**
     * obtain directories
     */
    public static function getDirectories(string $subdir = null, bool $hidden = false): Collection
    {
        $items = collect(
            Storage::disk('recordings')->directories($subdir)
        );
        
        $hidden || $items = static::filterHidden($items);

        return $items;
    }

    /**
     * obtain files
     */
    public static function getFiles(string $subdir = null, bool $hidden = false): Collection
    {
        $items = collect(
            Storage::disk('recordings')->files($subdir)
        );
        
        $hidden || $items = static::filterHidden($items);

        return $items;
    }

    /**
     * obtain all directories
     */
    public static function getAllDirectories(bool $hidden = false): Collection
    {
        $items = collect(
            Storage::disk('recordings')->allDirectories()
        );
        
        $hidden || $items = static::filterHidden($items);

        return $items;
    }

    /**
     * remove hidden items
     */
    private static function filterHidden(Collection $items): Collection
    {
        return $items->filter(fn($item) => $item[0] !== '.' && !Str::contains($item, '/.'));
    }
}
