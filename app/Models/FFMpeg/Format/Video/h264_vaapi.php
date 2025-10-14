<?php

namespace App\Models\FFMpeg\Format\Video;

use FFMpeg\Format\Video\X264;
use Illuminate\Support\Collection;
use App\Models\FFMpeg\Actions\Helper\Libx264Options;

class h264_vaapi extends X264
{
    const HIGH_QUALITY_QP = 18;

    const ACCEL_VAAPI = 'vaapi';

    const ACCEL_CUDA = 'cuda';

    private $vaapiDevice;

    private ?int $constantQuantizationParameter = null;

    public string $accelerationFramework = '';

    public function __construct($audioCodec = 'aac', $videoCodec = 'h264_vaapi')
    {
        $this->vaapiDevice = config('transcode.vaapiDevice');
        parent::__construct($audioCodec, $videoCodec);
    }

    public function setConstantQuantizationParameter(int $p = 25)
    {
        $this->kiloBitrate = 0;
        $this->constantQuantizationParameter = $p;
        return $this;
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

    public function getAvailableAudioCodecs()
    {
        return ['copy', 'aac', 'ac3', 'flac'];
    }

    public function setAudioCodec($audioCodec)
    {
        if ($audioCodec === 'copy') {
            $this->unsetAudioKiloBitrate();
        }
        return parent::setAudioCodec($audioCodec);
    }

    /**
     * {@inheritdoc}
     */
    public function getInitialParameters()
    {
        $hardware = [];
        if ($this->accelerationFramework === 'vaapi') {
            $hardware = [
                '-vaapi_device', $this->vaapiDevice,
            ];
        }

        if ($this->accelerationFramework === 'cuda') {
            $hardware = [
                '-hwaccel', 'cuda',
            ];
        }

        return array_merge($hardware, parent::getInitialParameters() ?? []);
    }

    public function getAdditionalParameters()
    {
        $params = [];
        if ($this->constantQuantizationParameter && !$this->kiloBitrate) {
            $params[] = '-qp';
            $params[] = (string)$this->constantQuantizationParameter;
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

    public function stripOptions(Collection $cmds): Collection
    {
        return Libx264Options::strip($cmds);
    }

    public function setAccelerationFramework($framework) {
        $this->accelerationFramework = $framework;
    }

    public function getAccelerationFramework(): string
    {
        return $this->accelerationFramework;
    }
}