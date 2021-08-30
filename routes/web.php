<?php

use App\Events\FilePicker as FilePickerEvent;
use App\Events\Transcode\Config\Streams as BroadcastStreams;
use App\Models\FilePicker;
use App\Models\Video\File as VideoFile;
use Illuminate\Support\Facades\Route;
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

Route::get('/', fn() => view('home', ['ds' => DIRECTORY_SEPARATOR]));

Route::get('/file-picker/{subdir?}', function (string $subdir = null) {
    
    FilePickerEvent::dispatch(FilePicker::root('recordings')::getItems($subdir), $subdir ?? 'root');

})->where('subdir', '(.*)')->name('filepicker');

Route::get('/concat/{path?}', function (string $path = null) {
    
    ProcessVideo::dispatch('concat', 'recordings', $path);

})->where('path', '(.*)');

Route::get('/transcode/{path?}', function (string $path = null) {
    
    ProcessVideo::dispatch('transcode', 'recordings', $path, '00:02:14.580', '00:50:41.620');

})->where('path', '(.*)');

Route::get('/streams/{path?}', function (string $path = null) {
    
    $media = VideoFile::getMedia('recordings', $path);
    $streams = $media->getStreams();
    $format = $media->getFormat()->all();
    BroadcastStreams::dispatch($format, $streams);

})->where('path', '(.*)');