<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;
use App\Jobs\ProcessVideo;

Class ScaleCPU extends Scale
{
    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute(?ProcessVideo $job = null)
    {
        $this->job = $job;
        $this->format->setAudioCodec('copy')->setPasses(1);
        $this->width = $this->requestData['width'];
        $this->height = $this->requestData['height'];
        $this->aspect = $this->requestData['aspect'];
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
        $cmds->push('-filter:v', self::getFilterString($this->width, $this->height));
        $cmds->push('-aspect', $this->aspect);
        $cmds->push('-c:s', 'copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }

    public static function getFilterString(int $width, int $height) {
        return sprintf('scale=%d:%d', $width, $height);
    }
}