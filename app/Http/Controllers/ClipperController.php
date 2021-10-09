<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clipper\ImageRequest;
use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClipperController extends Controller
{
    public function image(ImageRequest $request, string $path):? StreamedResponse
    {
        try {
            return Response::stream(function () use ($path, $request) {
                echo Image::getImageData('recordings', $path, $request->input('timestamp'), $request->input('width'), $request->input('height'));
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
