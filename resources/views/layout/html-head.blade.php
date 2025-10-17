<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Transcoder</title>
<link href="{{ mix('/css/app.css') }}" rel="stylesheet">
<script>
    const VIDEO_CODECS = @json(config('transcode.videoCodecs'));
    const AUDIO_CODECS = @json(config('transcode.audioCodecs'));
    const SUBTITLE_CODECS = @json(config('transcode.subtitleCodecs'));
    const LARAVEL_WEBSOCKETS_PORT = {{ (int)config('websockets.dashboard.port') }};
    const LARAVEL_WEBSOCKETS_KEY = {{ (int)(config('websockets.apps')[0]['key']) }};
    const PREFERRED_LANGUAGES = @json(config('transcode.preferredLanguages'));
</script>
<script src="{{ mix('/js/app.js') }}"></script>