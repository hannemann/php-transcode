<?php

namespace App\Models\FFMpeg;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use FFMpeg\Coordinate\TimeCode;

/**
 * @property string $disk
 * @property string $path
 * @property array $clips
 */
class ConcatDemuxer
{
    public function __construct(string $disk, string $path, array $clips)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->clips = $clips;
    }

    public function generateFile(): ConcatDemuxer
    {
        $timestamp = 0;
        $content = collect($this->clips)->map(function ($clip) use (&$timestamp) {
            $timestamp += TimeCode::fromString($clip['to']) ->toSeconds() - TimeCode::fromString($clip['from'])->toSeconds();
            return implode("\n", [
                sprintf("file '%s'", $this->getStoragePath() . ltrim($this->path, DIRECTORY_SEPARATOR)),
                sprintf('inpoint %s', $clip['from']),
                sprintf('outpoint %s', $clip['to']),
                sprintf('# Cut: %s', TimeCode::fromSeconds($timestamp)),
            ]);
        })->join("\n");
        Storage::disk($this->disk)->put($this->getInputFilename(), $content);
        return $this;
    }

    public function addCommands(Collection $cmds): Collection
    {
        $initial = [
            '-safe', '0',
            '-segment_time_metadata', '1',
            '-f', 'concat',
        ];
        $additional = ['-vf', 'select=concatdec_select',
            '-af', 'aselect=concatdec_select,aresample=async=1',
            '-video_track_timescale', '90000'
        ];

        $cmds->splice($cmds->search('-i'), 0, $initial);

        return $cmds->concat($additional);
    }

    public function getInputFilename($full = false): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if ($full) {
            $path = $this->getStoragePath() . $path;
        }
        return sprintf('%s%s-concat-demux.txt', $path, sha1($this->path));
    }

    private function getStoragePath(): string
    {
        return rtrim(
            Storage::disk($this->disk)->getDriver()->getAdapter()->getPathPrefix(),
            DIRECTORY_SEPARATOR
        ) . DIRECTORY_SEPARATOR;
    }

    public function getDuration(): float
    {
        $duration = 0;
        foreach($this->clips as $clip) {
            $to = TimeCode::fromString($clip['to']);
            $from = TimeCode::fromString($clip['from']);
            $duration += $to->toSeconds() - $from->toSeconds();
        }
        return $duration;
    }
}
