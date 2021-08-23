<?php

use App\Models\Recording;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
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

Route::get('/', function () {
    return view('home', ['directories' => Recording::getDirectories()]);
});

Route::get('/{directory}', function ($directory) {

    if (Recording::getDirectories()->contains($directory)) {

        $streams = Vdr::getMediaInfo($directory)->getStreams();

        return view('home', ['directories' => Recording::getDirectories(), 'streams' => $streams]);
    }

})->name('directory');