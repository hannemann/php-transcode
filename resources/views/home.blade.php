@extends('layout.app')

<h1>Transcoder</h1>

@section('directories')

<div>
    <filepicker-root data-channel="{{ sha1('root') }}" data-ds="{{ DIRECTORY_SEPERATOR }}"></filepicker-root>
</div>

@endsection

@section('content')
    @if (isset($streams))
        @foreach($streams as $stream)
            @include('partials.streamInfo', ['stream' => $stream])
        @endforeach
    @endif
@endsection