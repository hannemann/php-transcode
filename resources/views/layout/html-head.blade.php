<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Transcoder</title>
<script>
    const VIDEO_CODECS = @json(config('transcode.videoCodecs'));
    const AUDIO_CODECS = @json(config('transcode.audioCodecs'));
    const SUBTITLE_CODECS = @json(config('transcode.subtitleCodecs'));
    const WEBSOCKETS_PORT = {{ (int)config('broadcasting.connections.reverb.options.port') }};
    const WEBSOCKETS_APP_KEY = {{ (int)config('broadcasting.connections.reverb.key') }};
    const PREFERRED_LANGUAGES = @json(config('transcode.preferredLanguages'));
    const PREFERRED_AUDIO_CODECS = @json(config('transcode.preferredAudioCodecs'));
</script>
@vite(['resources/css/app.css', 'resources/js/app.js'])