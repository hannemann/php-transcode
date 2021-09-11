<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Transcode;
use App\Events\FFMpegProgress;

class TranscodeController extends Controller
{
    public function transcode(TranscodeRequest $request, string $path):? JsonResponse
    {
        $data = $request->input();
        try {
            // (new Transcode('recordings', $path, $data['streams'], 0, $data['clips']))->execute();

            if (count($data['clips']) === 1) {
                Transcode::getFromToFilter($data['clips'][0]['from'], $data['clips'][0]['to']);
            }
            ProcessVideo::dispatch('transcode', 'recordings', $path, $data['streams'], $data['clips']);
            FFMpegProgress::dispatch('queue.progress');
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
