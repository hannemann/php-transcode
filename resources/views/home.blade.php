@extends('layout.app')

<h1>Transcoder</h1>

@section('directories')

<div>
@foreach($directories as $name)
    <filepicker-item data-type="d">{{ $name }}</filepicker-item>
@endforeach
</div>

@endsection

@section('content')
    @if (isset($streams))
        @foreach($streams as $stream)
            @include('partials.streamInfo', ['stream' => $stream])
        @endforeach
    @endif
@endsection