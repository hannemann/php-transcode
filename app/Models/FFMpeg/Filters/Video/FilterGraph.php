<?php

namespace App\Models\FFMpeg\Filters\Video;

use App\Helper\Settings;
use Illuminate\Support\Collection;
use App\Models\FFMpeg\Actions\CropCPU;
use App\Models\FFMpeg\Actions\ScaleCPU;
use App\Models\FFMpeg\Actions\DelogoCPU;
use App\Models\FFMpeg\Actions\RemovelogoCPU;

class FilterGraph
{
    const FILTER_TYPE_SCALE = 'scale';
    const FILTER_TYPE_DEINTERLACE = 'deinterlace';
    const FILTER_TYPE_CROP = 'crop';
    const FILTER_TYPE_DELOGO = 'delogo';
    const FILTER_TYPE_REMOVELOGO = 'removeLogo';

    private string $disk;
    private string $path;
    private ?string $timestamp;

    private ?Collection $graph = null;

    private ?Collection $filters = null;

    private int $width = 0;

    private int $height = 0;

    public function __construct(string $disk, string $path, ?string $timestamp = null)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->timestamp = $timestamp;
        $this->filters = collect([]);
    }

    public function __toString()
    {

        $settings = $this->getSettings();
        $filters = $settings->map(function($setting) {
            switch ($setting['filterType']) {
                case self::FILTER_TYPE_SCALE:
                    $this->filters->push($this->getScaleFilter($setting));
                    $this->width = $setting['width'];
                    $this->height = $setting['height'];
                    break;
                case self::FILTER_TYPE_DEINTERLACE:
                    $this->filters->push($this->getDeinterlaceFilter($setting));
                    break;
                case self::FILTER_TYPE_CROP:
                    $this->filters->push($this->getCropFilter($setting));
                    break;
                case self::FILTER_TYPE_DELOGO:
                    $this->filters->push($this->getDelogoFilter($setting));
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

    private function getScaleFilter(array $settings): string
    {
        return ScaleCPU::getFilterString($settings['width'], $settings['height']);
    }

    private function getDeinterlaceFilter(array $settings): string
    {
        return 'bwdif=mode=send_field:parity=auto:deint=all';
    }

    private function getCropFilter(array $settings): string
    {
        return CropCPU::getFilterString($settings);
    }

    private function getDelogoFilter(array $settings): string
    {
        return DelogoCPU::getFilterString($settings, $this->timestamp);
    }

    private function getRemoveLogoFilter(array $settings): string
    {
        $width = $this->width ? $this->width : $settings['w'];
        $height = $this->height ? $this->height : $settings['h'];

        return RemovelogoCPU::getFilterString(
            RemovelogoCPU::getBitMap($this->disk, $this->path, $settings['timestamp'], $width, $height, $this->filters->join(','))
        );
    }
}
