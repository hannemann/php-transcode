<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\Scale as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;

Class Scale extends AbstractAction
{
    protected string $filenameAffix = 'scale';
    protected string $filenameSuffix = 'ts';

    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute(int $width, int $height, string $aspect)
    {
        $this->width = $width;
        $this->height = $height;
        $this->aspect = $aspect;
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
        
        $cmds = $this->format->stripOptions($cmds);

        $cmds->push('-vf');
        $cmds->push(sprintf('scale=%d:%d', $this->width, $this->height));
        $cmds->push('-aspect');
        $cmds->push($this->aspect);

        $cmds->push('-c:v');
        $cmds->push('libx264');
        $cmds->push('-c:a');
        $cmds->push('copy');
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }
}