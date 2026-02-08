<?php

namespace App\Models\FFMpeg\Actions;

use FFMpeg\Format\Video\X264 as Format;
use FFMpeg\Coordinate\TimeCode;

class Fillborders extends AbstractAction
{
    const VALID_MODES = [
        'smear',
        'mirror',
        'fixed',
        'reflect',
        'wrap',
        'fade',
        'margins',
    ];

    const VALID_COLOR_MODES = ['fixed', 'fade'];

    const TEMPLATE_FILTER = 'fillborders=top=%d:right=%d:bottom=%d:left=%d:mode=%s';
    const TEMPLATE_ENABLE = 'enable=\'between(t,%f,%f)\'';
    const TEMPLATE_COLOR = 'color=%s';

    protected string $filenameAffix = 'fillborders';
    protected string $filenameSuffix = 'mkv';
    protected string $formatClass = Format::class;

    public static function getFilterString($data, ?string $timestamp = null): string
    {
        $filter = collect([
            sprintf(
                self::TEMPLATE_FILTER,
                $data['top'],
                $data['right'],
                $data['bottom'],
                $data['left'],
                $data['mode']
            )
        ]);

        if ($data['color'] ?? null && in_array($data['mode'], self::VALID_COLOR_MODES)) {
            $filter->push(sprintf(self::TEMPLATE_COLOR, $data['color']));
        }

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
            $filter->push(sprintf(self::TEMPLATE_ENABLE, $data['between']['from'], $data['between']['to']));
        }

        return $filter->join(':');
    }
}
