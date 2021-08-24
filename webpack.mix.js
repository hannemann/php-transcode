const mix = require('laravel-mix');

mix.babelConfig({
    presets: [
        "@babel/preset-env"
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
        ["@babel/plugin-proposal-private-methods", { "loose": true }]
    ],
});

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [])
    .sourceMaps();
