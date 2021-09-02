<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Transcode;

class TranscodeController extends Controller
{
    public function transcode(TranscodeRequest $request, string $path):? JsonResponse
    {
        $data = $request->input();
        try {
            //(new Transcode('recordings', $path, $data['streams'], $data['clip']['from'], $data['clip']['to']))->execute();

            $data['clip']['from'] && Transcode::getFromToFilter($data['clip']['from'], $data['clip']['to']);
            ProcessVideo::dispatch('transcode', 'recordings', $path, $data['streams'], $data['clip']['from'], $data['clip']['to']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
