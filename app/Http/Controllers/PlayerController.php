<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Jobs\Player;
use App\Models\FFMpeg\Player\Hls;

class PlayerController extends Controller
{
    public function stream(string $path):? JsonResponse
    {
        try {

            // (new Hls())->stream('recordings', $path);

            Player::dispatch('recordings', $path);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }

    public function playlist(string $path)
    {
        try {
            return response(
                Hls::playlist('recordings', $path),
                200,
                ['Content-Type' => 'application/x-mpegURL']
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
    }

    public function segment(string $path)
    {
        try {
            return response(
                Hls::segment('recordings', $path),
                200,
                ['Content-Type' => 'video/mp2t']
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
    }

    public function cleanup(string $path): JsonResponse
    {
        try {
            Hls::cleanup('recordings', $path);
            return response()->json(
                ['message' => 'Cleanup done;'],
                200
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
    }
}
