<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Format\Video\RemuxTS as Format;
use App\Models\Video\File;
use App\Models\CurrentQueue;

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
        $this->outputMapper = new OutputMapper($this->codecConfig, $this->video, $this->audio, $this->subtitle);
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
        $cmds = $this->outputMapper->mapAll($cmds);
        $cmds->push($file);
        return [$cmds->all()];
    }

    /**
     * update queue
     */
    protected function saveProgress($percentage, $remaining, $rate): void
    {
        CurrentQueue::where('id', $this->current_queue_id)->update([
            'percentage' => $percentage,
            'remaining' => $remaining,
            'rate' => $rate,
        ]);
    }
}