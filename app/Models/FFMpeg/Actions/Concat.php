<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use Illuminate\Support\Facades\Storage;
use App\Models\FFMpeg\Format\Video\RemuxTS;
use FFMpeg\Coordinate\TimeCode;
use App\Models\FFMpeg\Filters\Video\ConcatDurationDummy;
use App\Jobs\ProcessVideo;
use App\Models\Video\File;

class Concat extends AbstractAction
{
    protected string $filenameAffix = 'concat';
    protected string $filenameSuffix = 'mkv';

    protected string $input = '';

    protected string $formatClass = RemuxTS::class;

    public function execute(?ProcessVideo $job = null)
    {
        $this->media = File::getMedia($this->disk, $this->path);
        $this->job = $job;
        $files = $this->getVideoFiles();
        $this->input = $this->getConcatInput($files);
        $this->mediaExporter = FFMpeg::fromDisk($this->disk)
            ->open($files[0])
            ->export()
            ->addFilter(new ConcatDurationDummy(new TimeCode(0, 0, 0, 0), $this->getConcatDuration($files)));
        $this->export();
    }

    private function getVideoFiles(): array
    {
        $collection = collect(FilePicker::root($this->disk)::getFiles(dirname($this->path)))
            ->map([FilePicker::class, 'getFileData']);

        return $collection->filter(function ($item) {
            return strpos($item['mime'], 'video') === 0 &&
                in_array($item['name'], $this->requestData['files']);
        })->pluck('path')->sort()->toArray();
    }

    private function getConcatInput(array $files): string
    {
        /** @var Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);
        $pathPrefix = rtrim($disk->getConfig()['root'], DIRECTORY_SEPARATOR);

        // 1. Inhalt der Liste generieren
        $fileListContent = collect($files)->map(function ($file) use ($pathPrefix) {
            // Pfad für FFmpeg: absolute Pfade innerhalb der Datei sind am sichersten
            $fullPath = $pathPrefix . DIRECTORY_SEPARATOR . ltrim($file, DIRECTORY_SEPARATOR);
            return "file '" . str_replace("'", "'\\''", $fullPath) . "'";
        })->implode("\n"); // Echtes Newline für die Datei

        // 2. Zielpfad für die Concat-Datei ermitteln (Verzeichnis der ersten Datei)
        $firstFile = $files[0];
        $directory = dirname($firstFile);

        // Eindeutiger Dateiname im selben Verzeichnis
        $concatFileName = $directory . DIRECTORY_SEPARATOR . bin2hex(random_bytes(8)) . '.concat.txt';

        // 3. Datei über den Laravel Storage schreiben
        $disk->put($concatFileName, $fileListContent);

        // 4. Den absoluten Pfad für FFmpeg zurückgeben
        return $pathPrefix . DIRECTORY_SEPARATOR . ltrim($concatFileName, DIRECTORY_SEPARATOR);
    }

    private function getConcatDuration(array $files): TimeCode
    {
        $durationInSeconds = 0;
        foreach ($files as $file) {
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
        $cmds->push('-hide_banner');
        $cmds->push('-f');
        $cmds->push('concat');
        $cmds->push('-safe');
        $cmds->push('0');
        $cmds->push('-i');
        $cmds->push($this->input);
        $cmds->push('-c');
        $cmds->push('copy');
        // foreach ($this->requestData['streams'] as $stream) {
        //     $cmds->push('-map', sprintf('0:%d', $stream));
        // }
        $cmds->push($file);
        return [$cmds->all()];
    }
}
