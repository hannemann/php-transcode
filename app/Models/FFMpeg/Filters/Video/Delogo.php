<?php

namespace App\Models\FFMpeg\Filters\Video;

use FFMpeg\Coordinate\TimeCode;

class Delogo
{
    const TEMPLATE_FILTER = 'delogo=x=%d:y=%d:w=%d:h=%d';
    const TEMPLATE_FILTER_BETWEEN = 'delogo=enable=\'between(t,%f,%f)\':x=%d:y=%d:w=%d:h=%d';

    public static function getFilterString($data, ?string $timestamp = ''): string
    {

        if ($timestamp && $data['between']['from'] && $data['between']['to']) {
            $current = new \DateTime($timestamp);
            $from = new \DateTime(TimeCode::fromSeconds($data['between']['from']));
            $to = new \DateTime(TimeCode::fromSeconds($data['between']['to']));
            if ($from < $current && $to > $current) {
                $data['between']['from'] = null;
                $data['between']['to'] = null;
            }
        }

        if ($data['between']['from'] && $data['between']['to']) {
            return sprintf(
                self::TEMPLATE_FILTER_BETWEEN,
                $data['between']['from'],
                $data['between']['to'],
                $data['x'],
                $data['y'],
                $data['w'],
                $data['h'],
            );
        }
        return sprintf(
            self::TEMPLATE_FILTER,
            $data['x'],
            $data['y'],
            $data['w'],
            $data['h'],
        ); // . ':show=1';
    }
}
