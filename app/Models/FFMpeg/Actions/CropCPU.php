<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;

Class CropCPU extends Crop
{
    const TEMPLATE_FILTER_CROP = 'crop=%d:%d:%d:%d,pad=%d:%d:(ow-iw)/2:(oh-ih)/2%s';
    const TEMPLATE_FILTER_FILLBORDERS = ',fillborders=left=0:right=0:top=%d:bottom=%d:mode=mirror';

    protected string $filenameAffix = 'crop';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute()
    {
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
            self::TEMPLATE_FILTER_CROP,
            $this->requestData['cw'],
            $this->requestData['ch'],
            $this->requestData['cx'],
            $this->requestData['cy'],
            $this->calculateWidth(
                $this->requestData['replaceBlackBorders'] ? $this->requestData['height'] : $this->requestData['ch'],
                $this->requestData['aspect']
            ),
            $this->requestData['replaceBlackBorders'] ? $this->requestData['height'] : $this->requestData['ch'],
            $this->requestData['mirror'] ?
                sprintf(
                    self::TEMPLATE_FILTER_FILLBORDERS,
                    $this->requestData['cy'],
                    $this->requestData['height'] - $this->requestData['ch'] - $this->requestData['cy']
                ) :
                ''
        ));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }
}