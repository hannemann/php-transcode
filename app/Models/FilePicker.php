<?php

namespace App\Models;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Helper\File as FileHelper;
use App\Models\Recording\Vdr;
use Illuminate\Filesystem\FilesystemAdapter;

class FilePicker
{
    private static ?FilesystemAdapter $disk = null;

    private static ?string $root = null;

    public static function root(string $root): string
    {
        static::$root = $root;
        return FilePicker::class;
    }

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
                'mime' => static::getMimeType($item),
                'size' => FileHelper::fileSizeH((int)static::disk()->size($item)),
                'lastModified' => static::disk()->lastModified($item),
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
        $items = collect(static::disk()->directories($subdir));
        return $hidden ? $items : static::filterHidden($items);
    }

    /**
     * obtain files
     */
    public static function getFiles(string $subdir = null, bool $hidden = false): Collection
    {
        $items = collect(static::disk()->files($subdir));
        return $hidden ? $items : static::filterHidden($items);
    }

    /**
     * obtain all directories
     */
    public static function getAllDirectories(bool $hidden = false): Collection
    {
        $items = collect(static::disk()->allDirectories());
        return $hidden ? $items : static::filterHidden($items);
    }

    /**
     * obtain mime type
     */
    public static function getMimeType(string $file): string
    {
        $fullFileName = static::disk()->getAdapter()->getPathPrefix() . $file;
        if (Vdr::isLegacy($fullFileName) && ($mime = Vdr::getMimeType($fullFileName))) {
            return $mime;
        }
        return static::disk()->mimeType($file);
    }

    /**
     * remove hidden items
     */
    private static function filterHidden(Collection $items): Collection
    {
        return $items->filter(fn($item) => $item[0] !== '.' && !Str::contains($item, '/.'));
    }

    /**
     * obtain disk instance
     */
    private static function disk(): FilesystemAdapter
    {
        if (!static::$disk) {
            static::$disk = Storage::disk(static::$root);
        }
        return static::$disk;
    }
}
