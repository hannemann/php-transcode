<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScaleRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Scale;

class ScaleController extends Controller
{
    public function scale(ScaleRequest $request, string $path):? JsonResponse
    {
        try {
            $data = $request->input();
            // (new Scale('recordings', $path, 0))->execute($data['width'], $data['height'], $data['aspect']);
            ProcessVideo::dispatch('scale', 'recordings', $path, [], null, null, $data['width'], $data['height'], $data['aspect']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
