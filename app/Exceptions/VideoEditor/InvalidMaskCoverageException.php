<?php

namespace App\Exceptions\VideoEditor;

class InvalidMaskCoverageException extends \Exception
{
    public $code = 422;

    public function __construct(float $percentage, int $limit = 10)
    {
        parent::__construct(
            sprintf(
                'Mask area too large. Your removelogo selection is too extensive (%.2f%%). '
                . 'Please minimize the masked area to stay within the %d%% limit.',
                $percentage,
                $limit
            )
        );
    }
}