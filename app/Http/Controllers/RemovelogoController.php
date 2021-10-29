<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemovelogoRequest;
use App\Http\Requests\Clipper\ImageRequest;
use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use App\Models\FFMpeg\Actions\Removelogo;
use App\Models\FFMpeg\Actions\RemovelogoCPU;

class RemovelogoController extends Controller
{
    public function removelogo(RemovelogoRequest $request, string $path):? JsonResponse
    {
        try {
            $type = $request->input('type');
            if ($type === 'vaapi') {
            // (new Removelogo('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('removelogo', 'recordings', $path, $request);
        } elseif ($type === 'cpu') {
            // (new RemovelogoCPU('recordings', $path, 0, $request->input()))->execute();
            ProcessVideo::dispatch('removelogoCPU', 'recordings', $path, $request);
        }
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }

    public function image(ImageRequest $request, string $path):? StreamedResponse
    {
        try {
            return Response::stream(function () use ($path, $request) {
                echo Image::getLogoMaskData('recordings', $path, $request->input('timestamp'), $request->input('width'), $request->input('height'));
            }, 200, [
                "Content-Type" => 'image/jpeg',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }
}
