<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemuxRequest;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\RemuxMKV;

class RemuxController extends Controller
{
    public function remux(RemuxRequest $request, string $path):? JsonResponse
    {
        try {
            $data = $request->input();
            // (new RemuxMKV('recordings', $path, 0, $data['streams']))->execute();
            ProcessVideo::dispatch('remux', 'recordings', $path, $data['streams'], null, $data['container']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
