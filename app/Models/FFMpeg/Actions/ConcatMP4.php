<?php

namespace App\Models\FFMpeg\Actions;

use App\Models\FFMpeg\Format\Video\RemuxTS;

class ConcatMP4 extends Concat
{
    protected string $filenameAffix = 'concat';
    protected string $filenameSuffix = 'mp4';

    protected string $formatClass = RemuxTS::class;
}