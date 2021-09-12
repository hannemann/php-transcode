<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Transcode;
use App\Models\FFMpeg\RemuxTS;
use App\Events\FFMpegProgress;
use App\Models\FFMpeg\ConcatDemuxer;
use Illuminate\Support\Facades\Storage;

class TranscodeController extends Controller
{
    public function transcode(TranscodeRequest $request, string $path):? JsonResponse
    {
        $data = $request->input();
        try {
            // if (count($data['clips']) > 1) {
            //     $demuxer = new ConcatDemuxer('recordings', $path, $data['clips']);
            //     $demuxer->generateFile();
                // $remux = new RemuxTS('recordings', $path, 0);
                // $path = $remux->getOutputFilename();
                // $remux->execute();
            // }
            // (new Transcode('recordings', $path, $data['streams'], 0, $data['clips']))->execute();

            if (count($data['clips']) === 1) {
                Transcode::getFromToFilter($data['clips'][0]['from'], $data['clips'][0]['to']);
            } else {
                // remux first for better quality
                $remux = new RemuxTS('recordings', $path, 0);
                $pathCopy = $remux->getOutputFilename();
                if (!Storage::disk('recordings')->exists($pathCopy)) {
                    ProcessVideo::dispatch('remux', 'recordings', $path, []);
                }
                $path = $pathCopy;
                $demuxer = new ConcatDemuxer('recordings', $path, $data['clips']);
                $demuxer->generateFile();
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
