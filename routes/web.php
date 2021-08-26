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

Route::get('/', fn() => view('home'));

Route::get('/file/{path}', function ($path) {

    $streams = Vdr::getMediaInfo($path)->getStreams();
    return view('home', ['streams' => $streams]);

})->name('directory');


Route::get('/file-picker/{directory?}', function (string $directory = null) {
    
    FilePicker::dispatch(Recording::getItems($directory), $directory ?? 'root');

})->where('directory', '(.*)')->name('filepicker');