<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-layout="{{ config('layout.layout') }}">
    <head>
    @include('layout.html-head')
    </head>
    <body>
        @yield('content')
    </body>
</html>