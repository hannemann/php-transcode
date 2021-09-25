<?php

namespace App\Models\FFMpeg\Actions;

class RemuxMKV extends RemuxTS
{
    protected string $filenameSuffix = 'mkv';
}