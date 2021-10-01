<?php

namespace App\Models\FFMpeg\Actions\Helper;

use Illuminate\Support\Collection;

class Libx264Options
{
    public static function strip(Collection $cmds): Collection
    {
        $cmds->splice($cmds->search('-threads'), 2);
        if (is_numeric($cmds->search('-refs'))) {
            $startIndex = $cmds->search('-refs');
            if ($endIndex = $cmds->search('-trellis')) {
                $endIndex += 2;
            } else {
                $endIndex = $cmds->count() - 1;
            }
            $cmds->splice($startIndex, $endIndex - $startIndex);
        }
        return $cmds;
    }
}