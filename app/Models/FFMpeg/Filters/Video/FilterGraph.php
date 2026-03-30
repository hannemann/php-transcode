<?php

namespace App\Models\FFMpeg\Filters\Video;

use App\Helper\Settings;
use Illuminate\Support\Collection;
use App\Models\FFMpeg\Filters\Video\Removelogo;
use App\Models\FFMpeg\Filters\Video\Delogo;
use App\Models\FFMpeg\Filters\Video\Fillborders;
use App\Models\FFMpeg\Filters\Video\Pad;
use App\Models\FFMpeg\Filters\Video\Scale;
use App\Models\FFMpeg\Filters\Video\Crop;

class FilterGraph
{
    const FILTER_TYPE_SCALE = 'scale';
    const FILTER_TYPE_DEINTERLACE = 'deinterlace';
    const FILTER_TYPE_CROP = 'crop';
    const FILTER_TYPE_DELOGO = 'delogo';
    const FILTER_TYPE_REMOVELOGO = 'removeLogo';
    const FILTER_TYPE_FILLBORDERS = 'fillborders';
    const FILTER_TYPE_PAD = 'pad';

    private string $disk;
    private string $path;
    private ?string $timestamp;
    private ?int $currentFilter;

    private ?Collection $graph = null;

    private ?Collection $filters = null;

    private int $width = 0;

    private int $height = 0;

    public function __construct(string $disk, string $path, ?string $timestamp = null, ?int $currentFilter = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->timestamp = $timestamp;
        $this->currentFilter = $currentFilter;
        $this->filters = collect([]);
    }

    public function __toString()
    {

        $settings = $this->getSettings();
        $filters = $settings->filter(function ($setting, int $key) {
            if ($this->currentFilter !== null && $key > $this->currentFilter - 1) {
                return false;
            }
            if ($setting['noProcessing'] ?? null) return false;
            return true;
        })->map(function ($setting) {

            switch ($setting['filterType']) {
                case self::FILTER_TYPE_SCALE:
                    $this->filters->push(Scale::getFilterString($setting['width'], $setting['height']));
                    $this->width = $setting['width'];
                    $this->height = $setting['height'];
                    break;
                case self::FILTER_TYPE_DEINTERLACE:
                    $this->filters->push($this->getDeinterlaceFilter($setting));
                    break;
                case self::FILTER_TYPE_CROP:
                    $this->filters->push(Crop::getFilterString($setting));
                    break;
                case self::FILTER_TYPE_PAD:
                    $this->filters->push(Pad::getFilterString($setting));
                    break;
                case self::FILTER_TYPE_DELOGO:
                    $this->filters->push(Delogo::getFilterString($setting, $this->timestamp));
                    break;
                case self::FILTER_TYPE_FILLBORDERS:
                    $this->filters->push(Fillborders::getFilterString($setting, $this->timestamp));
                    break;
                case self::FILTER_TYPE_REMOVELOGO:
                    $this->filters->push($this->getRemoveLogoFilter($setting));
                    break;
            }
            return $this->filters->last();
        });

        return $filters->join(',');
    }

    public function getSettings(): Collection
    {
        if (!$this->graph) {
            $this->graph = collect(Settings::getSettings($this->path)['filterGraph'] ?? []);
        }
        return $this->graph;
    }

    private function getDeinterlaceFilter(array $settings): string
    {
        return 'bwdif=mode=send_field:parity=auto:deint=all';
    }

    private function getRemoveLogoFilter(array $settings): string
    {
        $width = $this->width ? $this->width : $settings['w'];
        $height = $this->height ? $this->height : $settings['h'];
        $fileId = $settings['fileId'] ?? '';

        return Removelogo::getFilterString(
            Removelogo::getBitMap($this->disk, $this->path, $settings['timestamp'], $width, $height, $fileId, $this->filters->join(',')),
            $settings
        );
    }
}
