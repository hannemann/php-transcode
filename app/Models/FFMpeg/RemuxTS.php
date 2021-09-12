<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Format\Video\RemuxTS as RemuxFormat;
use App\Models\Video\File;
use App\Models\CurrentQueue;

class RemuxTS
{
    public function __construct(string $disk, string $path, int $current_queue_id)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->current_queue_id = $current_queue_id;
    }

    public function execute()
    {
        $format = new RemuxFormat();
        $out = $this->getOutputFilename();

        $media = File::getMedia($this->disk, $this->path);

        $videoFormat = $media->getFormat();
        $duration = $videoFormat->get('duration');
        $clipDuration = $duration;
        
        $media->export()
        ->onProgress(function ($percentage, $remaining, $rate) use ($duration, $clipDuration) {

            if ($duration !== $clipDuration && $percentage < 100) {
                $processed = $duration * $percentage / 100;
                $percentage = round(100 / $clipDuration * $processed);
            }

            CurrentQueue::where('id', $this->current_queue_id)->update(['percentage' => $percentage]);
        })
        ->inFormat($format)
        ->beforeSaving(function ($commands) use ($format) {

            $file = array_pop($commands[0]);
            $cmds = collect($commands[0]);
            $cmds = $format->stripOptions($cmds);
            $cmds = $cmds->replace([$cmds->search('-vcodec') => '-c:v', $cmds->search('-acodec') => '-c:a']);
            $cmds->push('-c:s');
            $cmds->push('copy');
            $cmds->push('-map');
            $cmds->push('0:v?');
            $cmds->push('-map');
            $cmds->push('0:a?');
            $cmds->push('-map');
            $cmds->push('0:s?');
            $cmds->push($file);


            return [$cmds->all()];
        })
        ->save($out);
    }

    public function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s.copy.ts', $path, sha1($this->path));
    }
}