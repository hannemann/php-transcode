<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clipper\ImageRequest;
use App\Models\FFMpeg\Clipper\Image;
use App\Models\FFMpeg\Clipper\Thumbnails;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\JsonResponse;

class ClipperController extends Controller
{
    public function image(ImageRequest $request, string $path): ?Response
    {
        try {
            return ResponseFacade::stream(function () use ($path, $request) {
                echo Image::getImageData('recordings', $path, $request->input('timestamp'), $request->input('width'), $request->input('height'), (bool)$request->input('filtered'), $request->input('current_filter'));
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

    public function thumbnails(string $path, string $duration, int $count): JsonResponse
    {
        try {
            $thumbs = Thumbnails::createThumbnails('recordings', $path, (float)$duration, (int)$count);
            return response()->json($thumbs, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => sprintf($e->getMessage())
            ], 500);
        }
    }
}
