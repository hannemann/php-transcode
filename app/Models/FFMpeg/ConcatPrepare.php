<?php

namespace App\Models\FFMpeg;

use App\Models\FFMpeg\Format\Video\ConcatPrepare as Format;

class ConcatPrepare extends RemuxTS
{
    public function __construct(string $disk, string $path, int $current_queue_id)
    {
        parent::__construct($disk, $path, $current_queue_id);
        $this->format = new Format();
    }

    public function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf('%s%s.pre-concat.mkv', $path, sha1($this->path));
    }
}