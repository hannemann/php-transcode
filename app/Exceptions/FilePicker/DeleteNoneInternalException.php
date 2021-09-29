<?php

namespace App\Exceptions\FilePicker;

class DeleteNoneInternalException extends \Exception
{
    public function __construct()
    {
        parent::__construct('File is not internal');
    }
}