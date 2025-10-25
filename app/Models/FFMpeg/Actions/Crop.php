<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\h264_vaapi as Format;
use App\Models\Video\File;
use App\Models\FFMpeg\Actions\Helper\OutputMapper;
use App\Jobs\ProcessVideo;

/**
 * @property h264_vaapi $format
 */
Class Crop extends AbstractAction
{
    const TEMPLATE_FILTER_CROP = 'hwdownload,crop=%d:%d:%d:%d,pad=%d:%d:(ow-iw)/2:(oh-ih)/2,format=nv12,hwupload,scale_vaapi=%d:%d';

    protected string $filenameAffix = 'crop';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    /**
     * handle
     */
    public function execute(?ProcessVideo $job = null)
    {
        $this->job = $job;
        $this->format->setConstantQuantizationParameter(Format::HIGH_QUALITY_QP)
            ->setAudioCodec('copy');
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
        $cmds->push('-filter:v');
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
            self::calculateWidth($this->requestData['height'],$this->requestData['aspect']),
            $this->requestData['height']
        ));
        $cmds->push('-c:s');
        $cmds->push('copy');
        $cmds = OutputMapper::mapAll($cmds);

        $cmds->push($file);
        return [$cmds->all()];
    }

    protected static function calculateWidth(int $height, string $aspect): int
    {
        $ratios = explode(':', $aspect);
        return ($height / (int)$ratios[1]) * (int)$ratios[0];
    }
}