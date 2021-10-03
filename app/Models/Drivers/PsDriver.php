<?php

namespace App\Models\Drivers;

use Alchemy\BinaryDriver\AbstractBinary;

class PsDriver extends AbstractBinary
{
    public function getName()
    {
        return 'ps driver';
    }
}