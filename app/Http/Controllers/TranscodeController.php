<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Transcode;
use App\Models\FFMpeg\ConcatPrepare;
use App\Events\FFMpegProgress;
use App\Models\FFMpeg\ConcatDemuxer;
use Illuminate\Support\Facades\Storage;

class TranscodeController extends Controller
{
    public function transcode(TranscodeRequest $request, string $path):? JsonResponse
    {
        $data = $request->input();
        try {
            if (false) {
                $this->test($data, $path);
            } else {
                if (count($data['clips']) === 1) {
                    Transcode::getFromToFilter($data['clips'][0]['from'], $data['clips'][0]['to']);
                } else {
                    // prepare
                    $pre = new ConcatPrepare('recordings', $path, 0);
                    $pathCopy = $pre->getOutputFilename();
                    if (!Storage::disk('recordings')->exists($pathCopy)) {
                        ProcessVideo::dispatch('prepare', 'recordings', $path, $data['streams']);
                    }
                    $path = $pathCopy;
                    $demuxer = new ConcatDemuxer('recordings', $path, $data['clips']);
                    $demuxer->generateFile();
                }
                ProcessVideo::dispatch('transcode', 'recordings', $path, $data['streams'], $data['clips']);
                FFMpegProgress::dispatch('queue.progress');
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }

    private function test(array $data, string $path): void
    {
        if (count($data['clips']) > 1) {
            $demuxer = new ConcatDemuxer('recordings', $path, $data['clips']);
            $demuxer->generateFile();
            $pre = new ConcatPrepare('recordings', $path, 0, $data['streams']);
            $path = $pre->getOutputFilename();
            if (!Storage::disk('recordings')->exists($path)) {
                $pre->execute();
            }
        }

        (new Transcode('recordings', $path, 0, $data['streams'], $data['clips']))->execute();
    }
}
