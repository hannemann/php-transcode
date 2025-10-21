<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemovelogoRequest;
use App\Http\Requests\RemoveLogoCustomMaskUploadRequest;
use App\Http\Requests\Clipper\ImageRequest;
use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\JsonResponse;
use App\Jobs\ProcessVideo;
use Illuminate\Support\Facades\Storage;

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
                'status' => 500,
                'message' => sprintf($e->getMessage())
            ], 500);
        }
        return null;
    }

    public function saveCustomMask(RemoveLogoCustomMaskUploadRequest $request, string $path): JsonResponse
    {
        try {
            $imageName = 'logomask.jpg';

            $imageBase64 = $request->input('image');
            $imageBase64 = preg_replace('/^data:[^,]*,/', '', $imageBase64);
            $image = imageCreateFromString(base64_decode($imageBase64));

            $stream = fopen('php://memory','r+');
            imagejpeg($image, $stream, 100);
            rewind($stream);
            $imageData = stream_get_contents($stream);
            //throw new \Exception('Huba lala');

            Storage::disk('recordings')->put(dirname($path) . DIRECTORY_SEPARATOR . $imageName, $imageData);
            return response()->json([
                'message' => 'Image uploaded successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
