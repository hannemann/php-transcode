@extends('layout.app')

@section('directories')

<ul>
@foreach($directories as $name)
    <li><a href="{{ route('directory', ['directory' => $name]) }}">{{ $name }}</a></li>
@endforeach
</ul>

@endsection

@section('content')
@if (isset($streams))
@foreach($streams as $stream)
@include('partials.streamInfo', ['stream' => $stream])
@endforeach
@endif
@endsection