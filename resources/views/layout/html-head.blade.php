<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Transcoder</title>
<link href="{{ mix('/css/app.css') }}" rel="stylesheet">
<script>
    const VIDEO_CODECS = {{ env('VIDEO_CODECS') }}
    const AUDIO_CODECS = {{ env('AUDIO_CODECS') }}
</script>
<script src="{{ mix('/js/app.js') }}"></script>