<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Transcode;
use App\Models\FFMpeg\Actions\ConcatPrepare;
use App\Events\FFMpegProgress;
use App\Helper\Settings;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Exporters\EncodingException;
use App\Models\CurrentQueue;
use App\Events\FilePicker as EventsFilePicker;
use App\Models\FilePicker;

class TranscodeController extends Controller
{
    public function transcode(TranscodeRequest $request, string $path):? JsonResponse
    {
        try {
            $data = $request->input();
            Settings::save($path, $data);
            if (false) {
                $this->test($path, $data, $request);
            } else {
                if (count($data['clips']) === 1) {
                    Transcode::getFromToFilter($data['clips'][0]['from'], $data['clips'][0]['to']);
                } else {
                    // prepare
                    $pre = new ConcatPrepare('recordings', $path, 0, $request->input());
                    $pathCopy = $pre->getOutputFilename();
                    if (!Storage::disk('recordings')->exists($pathCopy)) {
                        ProcessVideo::dispatch('prepare', 'recordings', $path, $request);
                    }
                    $path = $pathCopy;
                }
                ProcessVideo::dispatch('transcode', 'recordings', $path, $request);
                FFMpegProgress::dispatch('queue.progress');
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }

    private function test(string $path, array $data, TranscodeRequest $request): void
    {
        $type = '';
        try {
            if (count($data['clips']) > 1) {
                $type = 'prepare';
                $currentQueue = new CurrentQueue([
                    'path' => $path,
                    'streams' => $data['streams'],
                    'clips' => json_encode($data['clips']),
                    'type' => $type,
                    'state' => CurrentQueue::STATE_PENDING,
                    'percentage' => 0,
                    'rate' => 0,
                    'remaining' => 0,
                ]);
                $currentQueue->save();
                $current_queue_id = $currentQueue->getKey();

                $pre = new ConcatPrepare('recordings', $path, $current_queue_id, $request->input());
                $path = $pre->getOutputFilename();
                if (!Storage::disk('recordings')->exists($path)) {
                    $pre->execute();
                }
            }

            $type = 'transcode';
            $currentQueue = new CurrentQueue([
                'path' => $path,
                'streams' => $data['streams'],
                'clips' => json_encode($data['clips']),
                'type' => $type,
                'state' => CurrentQueue::STATE_PENDING,
                'percentage' => 0,
                'rate' => 0,
                'remaining' => 0,
            ]);
            $currentQueue->save();
            $current_queue_id = $currentQueue->getKey();

            (new Transcode('recordings', $path, $current_queue_id, $request->input()))->execute();
        } catch (EncodingException $e) {
            $command = $e->getCommand();
            $errorLog = $e->getErrorOutput();
            $errorMessage = sprintf("%s\n\n%s", $command, $errorLog);
            CurrentQueue::where('id', $current_queue_id)->update([
                'state' => CurrentQueue::STATE_FAILED,
                'exception' => $errorMessage,
            ]);
            FFMpegProgress::dispatch('queue.progress');
        }
    }

    public function saveSettings(TranscodeRequest $request, string $path):? JsonResponse
    {
        try {
            Settings::save($path, $request->input());
            $items = FilePicker::root('recordings')::getItems(dirname($path));
            EventsFilePicker::dispatch($items, dirname($path), true);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
