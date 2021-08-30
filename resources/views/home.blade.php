@extends('layout.app')

@section('content')
    <h1>Transcoder</h1>
    <filepicker-root data-channel="{{ sha1('root') }}" data-ds="{{ $ds }}"></filepicker-root>
    <transcode-configurator></transcode-configurator>
@endsection