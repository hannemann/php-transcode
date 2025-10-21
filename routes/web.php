<?php

use App\Events\FFMpegProgress;
use App\Events\FilePicker as FilePickerEvent;
use App\Events\TextViewer;
use App\Events\ImageViewer;
use App\Events\Transcode\Config\Streams as BroadcastStreams;
use App\Events\Transcode\Config\Clips as BroadcastClips;
use App\Exceptions\FilePicker\DeleteNoneInternalException;
use App\Helper\Settings;
use App\Http\Controllers\ClipperController;
use App\Http\Controllers\ConcatController;
use App\Http\Controllers\RemuxController;
use App\Http\Controllers\ScaleController;
use App\Http\Controllers\TranscodeController;
use App\Http\Controllers\CropController;
use App\Http\Controllers\DelogoController;
use App\Http\Controllers\RemovelogoController;
use App\Http\Controllers\PlayerController;
use App\Http\Requests\FFMpegActionRequest;
use App\Models\FilePicker;
use App\Models\Video\File as VideoFile;
use Illuminate\Support\Facades\Route;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\KillFFMpeg;
use App\Models\CurrentQueue;
use App\Models\FFMpeg\Actions\ConcatPrepare;
use Illuminate\Support\Facades\Storage;
use App\Models\FFMpeg\Actions\Scale;
use Illuminate\Support\Arr;

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

    if (FilePicker::root('recordings')::getFileData($path)['internal']) {
        Storage::disk('recordings')->delete($path);
    } else {
        throw new DeleteNoneInternalException();
    }

})->where('path', '(.*)');

Route::post('/concat/{path?}', [ConcatController::class, 'concat'])->where('path', '(.*)');
Route::post('/remux/{path}', [RemuxController::class, 'remux'])->where('path', '(.*)')->where('container', '(mp4|mkv|ts)');
Route::post('/transcode/{path}', [TranscodeController::class, 'transcode'])->where('path', '(.*)');
Route::post('/settings/{path}', [TranscodeController::class, 'saveSettings'])->where('path', '(.*)');
Route::post('/scale/{path}', [ScaleController::class, 'scale'])->where('path', '(.*)');
Route::post('/crop/{path}', [CropController::class, 'crop'])->where('path', '(.*)');
Route::post('/delogo/{path}', [DelogoController::class, 'delogo'])->where('path', '(.*)');
Route::post('/removelogoCustomMask/{path}', [RemovelogoController::class, 'saveCustomMask'])->where('path', '(.*)');
Route::post('/removelogo/{path}', [RemovelogoController::class, 'removelogo'])->where('path', '(.*)');
Route::get('/removelogo/{path}', [RemovelogoController::class, 'logomask'])->where('path', '(.*)');
Route::get('/removelogoImage/{path}', [RemovelogoController::class, 'image'])->where('path', '(.*)');
Route::post('/kill', fn () => KillFFMpeg::execute());
Route::get('/image/{path}', [ClipperController::class, 'image'])->where('path', '(.*)');
Route::get('/stream-playlist/{path}.m3u8', [PlayerController::class, 'playlist'])->where('path', '(.*)');
Route::get('/stream-segment/{path}', [PlayerController::class, 'segment'])->where('path', '(.*)');
Route::post('/stream/{path}', [PlayerController::class, 'stream'])->where('path', '(.*)');
Route::delete('/stream/{path}', [PlayerController::class, 'cleanup'])->where('path', '(.*)');

Route::get('/streams/{path?}', function (string $path = null) {
    
    try {
        $media = VideoFile::getMedia('recordings', $path);
        $probe = FFMpeg\Driver\FFProbeDriver::create(Arr::dot(config('laravel-ffmpeg')), null);
        $commands[] = '-show_chapters';
        $commands[] = '-print_format';
        $commands[] = 'json';
        $commands[] = sprintf(
            '%s/%s',
            config('filesystems.disks.recordings.root'),
            $path
        );
        $chapters = json_decode($probe->command($commands));
        BroadcastStreams::dispatch(
            $media->getFormat()->all(),
            Settings::decorateStreams($path, $media->getStreams()),
            Settings::getSettings($path)['crop'] ?? [],
            Settings::getSettings($path)['removeLogo'] ?? [],
            Settings::getSettings($path)['delogo'] ?? [],
            Settings::getSettings($path)['filterGraph'] ?? [],
            $chapters->chapters
        );
    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'message' => $e->getMessage(),
        ], 500);
    }

})->where('path', '(.*)');

Route::get('/clips/{path?}', function (FFMpegActionRequest $request, ?string $path = null) {
    
    try {
        $clips = Settings::getSettings($path)['clips'];
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

Route::post('/queue/cancel/{queue}', function (CurrentQueue $queue) {
    $queue->update(['state' => CurrentQueue::STATE_CANCELED]);
    FFMpegProgress::dispatch('queue.progress');
});