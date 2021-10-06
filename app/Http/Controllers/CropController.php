<?php

namespace App\Http\Controllers;

use App\Http\Requests\CropRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Crop;

class CropController extends Controller
{
    public function crop(CropRequest $request, string $path):? JsonResponse
    {
        try {
            // (new Crop('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('crop', 'recordings', $path, $request);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
