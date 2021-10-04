<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Concat;

class ConcatController extends Controller
{
    public function concat(string $path):? JsonResponse
    {
        try {
            // (new Concat('recordings', $path, 0))->execute();
            ProcessVideo::dispatch('concat', 'recordings', $path, []);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
