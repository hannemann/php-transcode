<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Format\Video\ConcatPrepare as Format;
use App\Models\Video\File;

class ConcatPrepare extends RemuxTS
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
        $this->codecMapper = new CodecMapper($this->codecConfig, $this->streams, $this->video, $this->audio, $this->subtitle);
        $this->codecMapper->forceCodec('copy', 'flac');
        $this->outputMapper = new OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
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
        $cmds = $this->codecMapper->execute($cmds);
        $cmds = $this->outputMapper->execute($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }
}