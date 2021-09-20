<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Format\Video\RemuxTS as Format;
use App\Models\Video\File;

class RemuxTS extends Transcode
{
    protected string $filenameAffix = 'remux';
    protected string $filenameSuffix = 'ts';

    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute()
    {
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
        $cmds = $cmds->replace([$cmds->search('-vcodec') => '-c:v', $cmds->search('-acodec') => '-c:a']);
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);
        $cmds->push($file);
        return [$cmds->all()];
    }

    protected function calculateProgress(int $percentage): int
    {
        return $percentage;
    }
}