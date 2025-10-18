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
        "qp" => 21,
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
    "flac" => [
        "v" => 2,
        "l" => "FLAC",
        "channels" => 6,
    ],
    "copy" => [
        "v" => 3,
        "l" => "Copy",
    ],
];
$subtitleCodecs = [
    "copy" => [
        "v" => 0,
        "l" => "Copy",
        "default" => true,
    ],
    "dvb_subtitle" => [
        "v" => 1,
        "l" => "dvb_subtitle",
        "default" => true,
    ],
    "dvd_subtitle" => [
        "v" => 2,
        "l" => "dvd_subtitle",
    ],
];
$preferredAudioCodecs = [
    "singleClip" => [
        2 => 'aac',
        6 => 'copy'
    ],
    "multiClip" => [
        2 => 'aac',
        6 => 'ac3'
    ]
];

return [
    'vaapiDevice' => env('VAAPI_DEVICE', '/dev/dri/renderD128'),
    'videoCodecs' => json_decode(env('VIDEO_CODECS', json_encode($videoCodecs))),
    'audioCodecs' => json_decode(env('AUDIO_CODECS', json_encode($audioCodecs))),
    'subtitleCodecs' => json_decode(env('SUBTITLE_CODECS', json_encode($subtitleCodecs))),
    'preferredLanguages' => json_decode(env('PREFERRED_LANGUAGES', json_encode([]))),
    'preferredAudioCodecs' => json_decode(env('PREFERRED_AUDIO_CODECS', json_encode($preferredAudioCodecs))),
];
