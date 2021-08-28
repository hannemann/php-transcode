<?php

namespace App\Models\FFMpeg\Format\Video;

use FFMpeg\Format\Video\X264;

class h264_vaapi extends X264
{

    private $renderDevice = '/dev/dri/renderD128';

    private ?int $constantQuantizationParameter = null;

    public function __construct($audioCodec = 'aac', $videoCodec = 'h264_vaapi')
    {
        parent::__construct($audioCodec, $videoCodec);
    }

    public function setConstantQuantizationParameter(int $p = 25)
    {
        $this->kiloBitrate = 0;
        $this->constantQuantizationParameter = $p;
    }

    public function setKiloBitrate($kiloBitrate)
    {
        parent::setKiloBitrate($kiloBitrate);
        $this->constantQuantizationParameter = 0;
    }

    public function unsetAudioKiloBitrate(): void
    {
        $this->audioKiloBitrate = null;
    }

    public function getAvailableVideoCodecs()
    {
        return ['h264_vaapi'];
    }

    /**
     * {@inheritdoc}
     */
    public function getInitialParameters()
    {
        $hardware = [
            '-hwaccel', 'vaapi',
            '-hwaccel_output_format', 'vaapi',
            '-vaapi_device', $this->renderDevice
        ];
        return array_merge($hardware, parent::getInitialParameters() ?? []);
    }

    public function getAdditionalParameters()
    {
        $params = [];
        if ($this->constantQuantizationParameter && !$this->kiloBitrate) {
            $params[] = '-qp';
            $params[] = $this->constantQuantizationParameter;
        }
        return array_merge(parent::getAdditionalParameters() ?? [], $params);
    }

    /**
     * {@inheritDoc}
     */
    public function getPasses()
    {
        return 1;
    }
}