<?php

namespace App\Models\Drivers;

use Alchemy\BinaryDriver\AbstractBinary;

class KillDriver extends AbstractBinary
{
    public function getName()
    {
        return 'kill driver';
    }
}