<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConcatRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Concat;

class ConcatController extends Controller
{
    public function concat(ConcatRequest $request, string $path):? JsonResponse
    {
        try {
            // (new Concat('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('concat', 'recordings', $path, $request);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
