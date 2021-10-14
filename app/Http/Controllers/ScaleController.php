<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScaleRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Scale;
use App\Models\FFMpeg\Actions\ScaleCPU;

class ScaleController extends Controller
{
    public function scale(ScaleRequest $request, string $path):? JsonResponse
    {
        try {
            $type = $request->input('type');
            if ($type === 'vaapi') {
                // (new Scale('recordings', $path, 0, $request->input()))->execute();
                ProcessVideo::dispatch('scale', 'recordings', $path, $request);
            } elseif ($type === 'cpu') {
                // (new ScaleCPU('recordings', $path, 0, $request->input()))->execute();
                ProcessVideo::dispatch('ScaleCPU', 'recordings', $path, $request);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
