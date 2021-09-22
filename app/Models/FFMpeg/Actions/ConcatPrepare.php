<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\ConcatPrepare as Format;
use App\Models\Video\File;

class ConcatPrepare extends AbstractAction
{
    protected string $filenameAffix = 'prepare';
    protected string $filenameSuffix = 'mkv';

    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute()
    {
        $this->media = File::getMedia($this->disk, $this->path);
        $this->initStreams();
        $this->codecMapper = new Helper\CodecMapper($this->codecConfig, $this->streams, $this->video, $this->audio, $this->subtitle);
        $this->codecMapper->forceCodec('copy', 'flac');
        $this->outputMapper = new Helper\OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
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
        $cmds->push('-c:a');
        $cmds->push('copy');
        $cmds = $this->codecMapper->execute($cmds);
        $cmds = $cmds->replace([$cmds->search('-c:v:0') => '-c:v']);
        $cmds = Helper\OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }
}