<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;

class ConcatController extends Controller
{
    public function concat(string $path):? JsonResponse
    {
        try {
            ProcessVideo::dispatch('concat', 'recordings', $path, []);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
