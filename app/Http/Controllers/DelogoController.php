<?php

namespace App\Http\Controllers;

use App\Http\Requests\DelogoRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Delogo;
use App\Models\FFMpeg\Actions\DelogoCPU;

class DelogoController extends Controller
{
    public function delogo(DelogoRequest $request, string $path):? JsonResponse
    {
        try {
            $type = $request->input('type');
            if ($type === 'vaapi') {
            // (new Crop('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('delogo', 'recordings', $path, $request);
        } elseif ($type === 'cpu') {
            // (new CropCPU('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('delogoCPU', 'recordings', $path, $request);
        }
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
