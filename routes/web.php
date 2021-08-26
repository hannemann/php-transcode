<?php

use App\Events\FilePicker as FilePickerEvent;
use App\Models\FilePicker;
use Illuminate\Support\Facades\Route;
use App\Models\Recording\Vdr;

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
    
    FilePickerEvent::dispatch(FilePicker::getItems($subdir), $subdir ?? 'root');

})->where('subdir', '(.*)')->name('filepicker');