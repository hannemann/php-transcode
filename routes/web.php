<?php

use App\Events\FilePicker as FilePickerEvent;
use App\Models\FilePicker;
use Illuminate\Support\Facades\Route;
use App\Models\Recording\Vdr;
use App\Jobs\ProcessVideo;

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

Route::get('/', fn() => view('home'));

Route::get('/file/{path}', function ($path) {

    $streams = Vdr::getMediaInfo($path)->getStreams();
    return view('home', ['streams' => $streams]);

})->name('directory');

Route::get('/file-picker/{subdir?}', function (string $subdir = null) {
    
    FilePickerEvent::dispatch(FilePicker::root('recordings')::getItems($subdir), $subdir ?? 'root');

})->where('subdir', '(.*)')->name('filepicker');

Route::get('/concat/{path?}', function (string $path = null) {
    
    ProcessVideo::dispatch('concat', 'recordings', $path);

})->where('path', '(.*)');

Route::get('/transcode/{path?}', function (string $path = null) {
    
    ProcessVideo::dispatch('transcode', 'recordings', $path, '00:02:14.580', '00:50:41.620');

})->where('path', '(.*)');