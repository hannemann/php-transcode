<?php

use App\Events\FFMpegProgress;
use App\Events\FilePicker as FilePickerEvent;
use App\Events\TextViewer;
use App\Events\Transcode\Config\Streams as BroadcastStreams;
use App\Events\Transcode\Config\Clips as BroadcastClips;
use App\Helper\Settings;
use App\Http\Controllers\TranscodeController;
use App\Models\FilePicker;
use App\Models\Video\File as VideoFile;
use Illuminate\Support\Facades\Route;
use App\Jobs\ProcessVideo;
use App\Models\CurrentQueue;
use App\Models\FFMpeg\Actions\Helper\ConcatDemuxer;
use App\Models\FFMpeg\Actions\ConcatPrepare;

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
    
    try {
        $items = FilePicker::root('recordings')::getItems($subdir);
        FilePickerEvent::dispatch($items, $subdir ?? 'root');
    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'message' => $e->getMessage(),
        ], 500);
    }

})->where('subdir', '(.*)');

Route::delete('/file-picker/{path}', function (string $path) {

    $x = 1;

})->where('path', '(.*)');

Route::post('/concat/{path?}', function (string $path = null) {

    // (new Concat('recordings', $path, 0))->execute();
    
    ProcessVideo::dispatch('concat', 'recordings', $path, []);

})->where('path', '(.*)');

Route::post('/remux/{container}/{path}', function (string $container, string $path = null) {

    // (new RemuxTS('recordings', $path, 0))->execute();
    
    ProcessVideo::dispatch('remux', 'recordings', $path, [], null, $container);

})->where('path', '(.*)')->where('container', '(mp4|mkv|ts)');

Route::post('/transcode/{path}', [TranscodeController::class, 'transcode'])->where('path', '(.*)');
Route::post('/settings/{path}', [TranscodeController::class, 'saveSettings'])->where('path', '(.*)');

Route::get('/streams/{path?}', function (string $path = null) {
    
    try {
        $media = VideoFile::getMedia('recordings', $path);
        BroadcastStreams::dispatch(
            $media->getFormat()->all(),
            Settings::decorateStreams($path, $media->getStreams())
        );
    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'message' => $e->getMessage(),
        ], 500);
    }

})->where('path', '(.*)');

Route::get('/clips/{path?}', function (string $path = null) {
    
    try {
        $settings = Settings::getSettings($path)['clips'];
        // $clips = (new ConcatDemuxer('recordings', $path))->getClips();
        if (empty($settings['clips'])) {
            $remux = new ConcatPrepare('recordings', $path, 0);
            $clips = Settings::getSettings($remux->getOutputFilename())['clips'];
            // $clips = (new ConcatDemuxer('recordings', $remux->getOutputFilename()))->getClips();
        }
        BroadcastClips::dispatch($clips);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'message' => $e->getMessage(),
        ], 500);
    }

})->where('path', '(.*)');

Route::get('/textviewer/{path}', function (string $path) {
    
    TextViewer::dispatch('recordings', $path);
})->where('path', '(.*)');

Route::get('/progress', function () {

    FFMpegProgress::dispatch('queue.progress');
});

Route::delete('/progress/{id}', function (CurrentQueue $id) {
    $id->delete();
    FFMpegProgress::dispatch('queue.progress');
})->where('id', '[0-9]+');