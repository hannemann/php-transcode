<?php

$videoCodecs = [
    "h264_vaapi" => [
        "v" => 0,
        "l" => "H264 (VAAPI)",
        "qp" => 25,
        "default" => true,
    ],
    "hevc_vaapi" => [
        "v" => 1,
        "l" => "H265 (VAAPI)",
        "qp" => 28,
    ],
    "copy" => [
        "v" => 2,
        "l" => "Copy",
    ],
];
$audioCodecs = [
    "ac3" => [
        "v" => 0,
        "l" => "AC3",
        "channels" => 6,
        "default" => true,
        "bitrate" => 160,
    ],
    "aac" => [
        "v" => 1,
        "l" => "AAC",
        "channels" => 2,
        "bitrate" => 128,
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
