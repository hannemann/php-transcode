<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;
use App\Models\FFMpeg\Actions\Crop;

Class CropCPU extends Crop
{
    const TEMPLATE_FILTER_CROP = 'crop=%d:%d:%d:%d,pad=%d:%d:(ow-iw)/2:(oh-ih)/2%s';
    const TEMPLATE_FILTER_FILLBORDERS = ',fillborders=left=%d:right=%d:top=%d:bottom=%d:mode=mirror';

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
        $cmds->push('-filter:v');
        $cmds->push(self::getFilterString($this->requestData));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }

    public static function getFilterString(array $data) {
        return sprintf(
            self::TEMPLATE_FILTER_CROP,
            $data['cw'],
            $data['ch'],
            $data['cx'],
            $data['cy'],
            Crop::calculateWidth(
                $data['replaceBlackBorders'] ? $data['height'] : $data['ch'],
                $data['aspect']
            ),
            $data['replaceBlackBorders'] ? $data['height'] : $data['ch'],
            $data['mirror'] ?
                sprintf(
                    self::TEMPLATE_FILTER_FILLBORDERS,
                    $data['cx'],
                    $data['width'] - $data['cw'] - $data['cx'],
                    $data['cy'],
                    $data['height'] - $data['ch'] - $data['cy']
                ) :
                ''
        );
    }
}