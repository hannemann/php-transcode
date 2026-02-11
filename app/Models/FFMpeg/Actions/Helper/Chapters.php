<?php

namespace App\Models\FFMpeg\Actions\Helper;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use FFMpeg\Coordinate\TimeCode;

/**
 * @property string $disk
 * @property string $path
 * @property array $clips
 */
class Chapters
{
    const FILE_EXTENSION = 'chp';
    const CHAPTER_OFFSET = 2;

    public function __construct(string $disk, string $path, array $clips = [])
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->clips = $clips;
    }

    /**
     * check if chepters should be removed
     */
    public function isActive(): bool
    {
        return true;
    }

    /**
     * remove all chapter from video
     * @param Collection $cmds
     * @return Collection $cmds
     */
    public function removeChapters(Collection $cmds): Collection
    {
        $cmds->push('-map_chapters', '-1');
        return $cmds;
    }

    /**
     * create .chp chapters file for reviewing cut points
     *
     * @param string $file name of transcoded file
     * @return void
     */
    public function createChaptersFileFromCutpoints(string $file): void
    {
        $cutPoints = [];
        $lines = [];
        $filename = sprintf('%s/%s.%s', dirname($this->path), basename($file), self::FILE_EXTENSION);

        foreach ($this->clips as $index => $clip) {

            $from = collect(explode(':', $clip['from']))
                ->reduce(self::reduceCoord(...), 0);
            $to = collect(explode(':', $clip['to']))
                ->reduce(self::reduceCoord(...), 0);
            $clipDuration = $to - $from;

            $cutPoints[] = max(
                0,
                ($cutPoints[$index - 1] ?? 0) + $clipDuration
            );

            $timestamp = TimeCode::fromSeconds($cutPoints[$index] - self::CHAPTER_OFFSET);

            $lines[] = sprintf(
                "%s %d seconds before Cut point %d",
                $timestamp,
                self::CHAPTER_OFFSET,
                $index + 1,
            );
        }

        Storage::disk($this->disk)->put($filename, implode("\n", $lines));
    }

    /**
     * reduce time coord to compute seconds
     */
    private static function reduceCoord($carry, $item, $key): float
    {
        return $carry + (
            $key === 0
            ? (int)$item * 60 * 60
            : (
                $key === 1
                ? ((int)$item * 60)
                : ((float)$item)
            )
        );
    }
}
