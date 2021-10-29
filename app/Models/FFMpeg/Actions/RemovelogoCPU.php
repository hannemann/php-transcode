<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;
use App\Models\FFMpeg\Clipper\Image;

Class RemovelogoCPU extends Crop
{
    const TEMPLATE_FILTER = 'removelogo=filename=%s';

    protected string $filenameAffix = 'removelogo';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute()
    {
        $this->bitmap = Image::createLogoMask(
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
        $cmds->push('-vf');
        $cmds->push(sprintf(
            self::TEMPLATE_FILTER,
            $this->bitmap
        ));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }
}