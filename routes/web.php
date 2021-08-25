<?php

use App\Events\FilePicker;
use App\Models\Recording;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Models\Recording\Vdr;
use App\Events\TestEvent;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('home', ['directories' => Recording::getDirectories()]);
});

Route::get('/bc', function () {
    TestEvent::dispatch('Ein Test');
});

Route::get('/file/{directory}', function ($directory) {

    if (Recording::getDirectories()->contains($directory)) {

        $streams = Vdr::getMediaInfo($directory)->getStreams();

        return view('home', ['directories' => Recording::getDirectories(), 'streams' => $streams]);
    }

})->name('directory');


Route::get('/file-picker/{directory?}', function (string $directory = null) {

    $directories = Recording::getDirectories($directory)
        ->map(fn($item) => [
            'name' => basename($item),
            'type' => 'd',
            'path' => $item,
            'channel' => sha1($item)
        ]
    );
    $files = Recording::getFiles($directory)
        ->map(fn($item) => [
            'name' => basename($item),
            'type' => 'f',
            'path' => $item,
            'channel' => sha1($item)
        ]
    );
    
    FilePicker::dispatch($directories->merge($files)->toArray(), $directory ?? 'root');

})->where('directory', '(.*)')->name('filepicker');