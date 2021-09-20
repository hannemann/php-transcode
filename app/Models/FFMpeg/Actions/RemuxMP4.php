<?php

namespace App\Models\FFMpeg\Actions;

class RemuxMP4 extends RemuxTS
{
    protected string $filenameSuffix = 'mp4';
}