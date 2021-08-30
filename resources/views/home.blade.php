@extends('layout.app')

@section('content')
    <ffmpeg-transcoder data-channel="{{ sha1('root') }}"></ffmpeg-transcoder>
@endsection