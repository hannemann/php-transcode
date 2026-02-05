<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;
use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File as FileFacade;
use App\Jobs\ProcessVideo;

Class RemovelogoCPU extends Crop
{
    const TEMPLATE_FILTER = 'removelogo=filename=%s';

    protected string $filenameAffix = 'removelogo';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    private string $bitmap;

    /**
     * handle
     */
    public function execute(?ProcessVideo $job = null)
    {
        $this->job = $job;
        $this->bitmap = self::getBitmap(
            $this->disk,
            $this->path,
            $this->requestData['timestamp'],
            $this->requestData['w'],
            $this->requestData['h']
        );
        $this->format->setAudioCodec('copy')->setPasses(1);
        $this->media = File::getMedia($this->disk, $this->path);
        $this->initStreams();
        $this->mediaExporter = $this->media->export();
        $this->export();
    }

    /**
     * update commands array
     */
    protected function updateCommands(array $commands): array
    {
        $file = array_pop($commands[0]);
        $cmds = collect($commands[0]);
        
        $cmds = Libx264Options::strip($cmds);
        $cmds->splice($cmds->search('-b:v'), 2);
        $cmds->splice($cmds->search('-b:a'), 2);
        $cmds->push('-crf', 18);
        $cmds->push('-preset', 'ultrafast');
        $cmds->push('-filter:v');
        $cmds->push(self::getFilterString($this->bitmap));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }

    public static function getBitMap(string $disk, string $path, string $timestamp, string $w, string $h, ?string $withFilters = ''): string
    {
        $customMask = self::getCustomMaskPath($path);

        if (self::hasCustomMask($customMask)) {
            return sprintf(
                '%s/%s',
                config('filesystems.disks.' . $disk . '.root'),
                $customMask
            );
        } else {
            return Image::createLogoMask(
                $disk,
                $path,
                $timestamp,
                $w,
                $h,
                $withFilters
            );
        }
    }

    public static function getFilterString(string $bitmap): string
    {
        return sprintf(
            self::TEMPLATE_FILTER,
            $bitmap
        );
    }

    public static function getCustomMaskPath(string $path): string
    {
        return sprintf(
            '%s%s%s',
            dirname($path),
            DIRECTORY_SEPARATOR,
            'logomask.png'
        );   
    }

    public static function hasCustomMask(string $path): bool
    {
        return Storage::disk('recordings')->exists($path);
    }

    public static function deleteMasks(string $path): void
    {

        $glob = implode(
            DIRECTORY_SEPARATOR,
            [
                config('filesystems.disks.recordings.root'),
                dirname($path),
                '*logomask.png'
            ]
        );
        FileFacade::delete(FileFacade::glob($glob));
    }
}