<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
    @include('layout.html-head')
    </head>
    <body>
        @yield('content')
    </body>
</html>