<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use FFMpeg\Coordinate\TimeCode;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;
use App\Jobs\ProcessVideo;

Class DelogoCPU extends Crop
{
    const TEMPLATE_FILTER = 'delogo=x=%d:y=%d:w=%d:h=%d';
    const TEMPLATE_FILTER_BETWEEN = 'delogo=enable=\'between(t,%f,%f)\':x=%d:y=%d:w=%d:h=%d';

    protected string $filenameAffix = 'delogo';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute(?ProcessVideo $job = null)
    {
        $this->job = $job;
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
        $cmds->push(self::getFilterString($this->requestData));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }

    public static function getFilterString($data, ?string $timestamp): string
    {

        if ($timestamp && $data['between']['from'] && $data['between']['to']) {
            $current = new \DateTime($timestamp);
            $from = new \DateTime(TimeCode::fromSeconds($data['between']['from']));
            $to = new \DateTime(TimeCode::fromSeconds($data['between']['to']));
            if ($from < $current && $to > $current) {
                $data['between']['from'] = null;
                $data['between']['to'] = null;
            }
        }

        if ($data['between']['from'] && $data['between']['to']) {
            return sprintf(
                self::TEMPLATE_FILTER_BETWEEN,
                $data['between']['from'],
                $data['between']['to'],
                $data['x'],
                $data['y'],
                $data['w'],
                $data['h'],
            );
        }
        return sprintf(
            self::TEMPLATE_FILTER,
            $data['x'],
            $data['y'],
            $data['w'],
            $data['h'],
        );// . ':show=1';
    }
}