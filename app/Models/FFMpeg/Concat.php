<?php

namespace App\Models\FFMpeg;

use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use App\Models\CurrentQueue;
use Illuminate\Support\Facades\Storage;

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

        $input = $this->getConcatInput($files);

        $export = FFMpeg::fromDisk($this->disk)
            ->open($files[0])
            ->export()
            ->onProgress(function ($percentage, $remaining, $rate) {
                CurrentQueue::where('id', $this->current_queue_id)->update(['percentage' => $percentage]);
            })
            ->beforeSaving(function ($commands) use ($input) {

                $file = array_pop($commands[0]);
                $cmds = collect($commands[0]);
                $cmds->splice($cmds->search('-threads'), 2);
                $cmds->splice($cmds->search('-i'), 2);
                $cmds->push('-i');
                $cmds->push($input);
                $cmds->push('-map');
                $cmds->push('0:v?');
                $cmds->push('-map');
                $cmds->push('0:a?');
                $cmds->push('-map');
                $cmds->push('0:s?');
                $cmds->push('-c');
                $cmds->push('copy');
                $cmds->push($file);
                return [$cmds->all()];
            });
        $export->save($out);
    }

    private function getVideoFiles(): array
    {
        $collection = collect(FilePicker::root($this->disk)::getFiles($this->path))
            ->map([FilePicker::class, 'getFileData']);

        return $collection->filter(function($item) {
            return strpos($item['mime'], 'video') === 0;
        })->pluck('path')->sort()->toArray();
    }

    private function getConcatInput(array $files): string {
        /** @var Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);
        $pathPrefix = rtrim($disk->getDriver()->getAdapter()->getPathPrefix(), DIRECTORY_SEPARATOR);
        return 'concat:' . collect($files)->map(function($file) use ($pathPrefix) {
            return $pathPrefix . DIRECTORY_SEPARATOR . ltrim($file, DIRECTORY_SEPARATOR);
        })->implode('|');
    }

    private function getOutputFilename(): string
    {
        $path = rtrim($this->path, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s-concat.ts', $path, sha1($this->path));
    }
}