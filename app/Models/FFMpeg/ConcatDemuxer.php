<?php

namespace App\Models\FFMpeg;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Str;

/**
 * @property string $disk
 * @property string $path
 * @property array $clips
 */
class ConcatDemuxer
{
    public function __construct(string $disk, string $path, array $clips = [])
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->clips = $clips;
    }

    public function isActive(): bool
    {
        return false;
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
        $cmds->replace([$cmds->search('-i') + 1 => $this->getInputFilename(true)]);

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
        /** @var Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);
        return rtrim(
            $disk->getDriver()->getAdapter()->getPathPrefix(),
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

    public function getClips(): array
    {
        $disk = Storage::disk($this->disk);
        if ($disk->exists($this->getInputFilename())) {
            $id = 1;
            $clips = [];
            $lines = collect(explode("\n", $disk->get($this->getInputFilename())))->filter(function ($line) {
                return Str::contains($line, 'inpoint') || Str::contains($line, 'outpoint');
            })->all();
            foreach($lines as $key => $line) {
                if (Str::contains($line, 'inpoint')) {
                    $clips[] = [
                        'from' => Str::replace('inpoint ', '', $line),
                        'to' => Str::replace('outpoint ', '', $lines[$key+1]),
                        'id' => $id++,
                    ];
                }
            }
            return $clips;
        }
        return [];
    }
}
