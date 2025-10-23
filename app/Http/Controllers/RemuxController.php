<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemuxRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;

class RemuxController extends Controller
{
    public function remux(RemuxRequest $request, string $path):? JsonResponse
    {
        try {
            // (new RemuxMKV('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('remux', 'recordings', $path, $request);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
