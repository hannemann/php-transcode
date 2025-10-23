<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Illuminate\Support\Facades\Storage;
use App\Models\FFMpeg\Format\Video\RemuxTS;
use FFMpeg\Coordinate\TimeCode;
use App\Models\FFMpeg\Filters\Video\ConcatDurationDummy;

class Concat extends AbstractAction
{
    protected string $filenameAffix = 'concat';
    protected string $filenameSuffix = 'mkv';

    protected string $input = '';

    protected string $formatClass = RemuxTS::class;

    public function execute(): void
    {
        $files = $this->getVideoFiles();
        $this->input = $this->getConcatInput($files);
        $this->mediaExporter = FFMpeg::fromDisk($this->disk)
            ->open($files[0])
            ->export()
            ->addFilter(new ConcatDurationDummy(new TimeCode(0,0,0,0), $this->getConcatDuration($files)));
        $this->export();
    }

    private function getVideoFiles(): array
    {
        $collection = collect(FilePicker::root($this->disk)::getFiles(dirname($this->path)))
            ->map([FilePicker::class, 'getFileData']);

        return $collection->filter(function($item) {
            return strpos($item['mime'], 'video') === 0 &&
                in_array($item['name'], $this->requestData['files']);
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

    private function getConcatDuration(array $files): TimeCode
    {
        $durationInSeconds = 0;
        foreach($files as $file) {
            $media = FFMpeg::fromDisk($this->disk)->open($file);
            $durationInSeconds += $media->getDurationInMiliseconds() / 1000;
        }
        return TimeCode::fromSeconds($durationInSeconds);
    }

    /**
     * update commands array
     */
    protected function updateCommands(array $commands): array
    {
        $file = array_pop($commands[0]);
        $cmds = collect([]);
        $cmds->push('-y');
        $cmds->push('-i');
        $cmds->push($this->input);
        $cmds->push('-c');
        $cmds->push('copy');
        foreach($this->requestData['streams'] as $stream) {
            $cmds->push('-map', sprintf('0:%d', $stream));
        }
        $cmds->push($file);
        return [$cmds->all()];
    }
}