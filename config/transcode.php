<?php

$videoCodecs = [
    "hevc_vaapi" => [
        "v" => 0,
        "l" => "H265 (VAAPI)",
        "qp" => 28,
    ],
    "h264_vaapi" => [
        "v" => 1,
        "l" => "H264 (VAAPI)",
        "qp" => 25,
        "default" => true,
    ],
    "copy" => [
        "v" => 2,
        "l" => "Copy",
    ],
];
$audioCodecs = [
    "aac" => [
        "v" => 0,
        "l" => "AAC",
        "channels" => 2,
    ],
    "ac3" => [
        "v" => 1,
        "l" => "AC3",
        "channels" => 6,
        "default" => true
    ],
    "copy" => [
        "v" => 2,
        "l" => "Copy",
    ],
];

return [
    'vaapiDevice' => env('VAAPI_DEVICE', '/dev/dri/renderD128'),
    'videoCodecs' => json_decode(env('VIDEO_CODECS', json_encode($videoCodecs))),
    'audioCodecs' => json_decode(env('AUDIO_CODECS', json_encode($audioCodecs))),
];