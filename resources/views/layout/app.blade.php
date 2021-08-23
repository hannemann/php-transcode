<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
    @include('layout.html-head')
    </head>
    <body>
        <main>
            <aside>
                @yield('directories')
            </aside>
            <section class="content">
                @yield('content')
            </section>
        </main>
    </body>
</html>