<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\RemuxTS as Format;
use App\Models\Video\File;
use App\Jobs\ProcessVideo;

/**
 * @property Format $format
 */
class RemuxTS extends AbstractAction
{
    protected string $filenameAffix = 'remux';
    protected string $filenameSuffix = 'ts';

    protected Helper\RemuxMapper $remuxMapper;

    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute(?ProcessVideo $job = null)
    {
        $this->job = $job;
        $this->media = File::getMedia($this->disk, $this->path);
        $this->initStreams();
        $this->remuxMapper = new Helper\RemuxMapper($this->codecConfig, $this->streams);
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
        $cmds = Helper\OutputMapper::mapAll($cmds);
        $cmds = $this->remuxMapper->execute($cmds);
        $cmds->push($file);
        return [$cmds->all()];
    }
}