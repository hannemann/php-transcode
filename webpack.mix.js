const mix = require('laravel-mix');
const path = require('path')

mix.alias({
    '@': path.join(__dirname, 'resources/js')
});

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css')
    .sourceMaps();
