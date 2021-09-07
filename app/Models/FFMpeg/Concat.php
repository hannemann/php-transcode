<?php

namespace App\Models\FFMpeg;

use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use App\Models\CurrentQueue;

class Concat
{
    public function __construct(string $disk, string $path, int $current_queue_id)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->current_queue_id = $current_queue_id;
    }

    public function execute(): void
    {
        $files = $this->getVideoFiles();
        $out = $this->getOutputFilename();

        FFMpeg::fromDisk($this->disk)
            ->open($files)
            ->export()
            ->onProgress(function ($percentage, $remaining, $rate) {
                CurrentQueue::where('id', $this->current_queue_id)->update(['percentage' => $percentage]);
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