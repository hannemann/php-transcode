<?php

namespace App\Models\FFMpeg;

use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use App\Events\FFMpegProcess as FFMpegProcessEvent;

class Concat
{
    public function __construct(string $disk, string $path)
    {
        $this->disk = $disk;
        $this->path = $path;
    }

    public function execute(): void
    {
        $files = $this->getVideoFiles();
        $out = $this->getOutputFilename();

        FFMpeg::fromDisk($this->disk)
            ->open($files)
            ->export()
            ->onProgress(function ($percentage, $remaining, $rate) {
                FFMpegProcessEvent::dispatch('concat.progress', $this->path, [
                    'percentage' => $percentage,
                    'remaining' => $remaining,
                    'rate' => $rate,
                ]);
            })
            ->concatWithoutTranscoding()
            ->save($out);
    }

    private function getVideoFiles(): array
    {
        $collection = collect(FilePicker::root($this->disk)::getFiles($this->path))
            ->map([FilePicker::class, 'getFileData']);

        return $collection->filter(function($item) {
            return strpos($item['mime'], 'video') === 0;
        })->pluck('path')->sort()->toArray();
    }

    private function getOutputFilename(): string
    {
        $path = rtrim($this->path, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s-concat.ts', $path, sha1($this->path));
    }
}