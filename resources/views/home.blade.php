@extends('layout.app')

<h1>Transcoder</h1>

<my-awesome-component></my-awesome-component>

@section('directories')

<div>
@foreach($directories as $name)
    <filepicker-directory>{{ $name }}</filepicker-directory>
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