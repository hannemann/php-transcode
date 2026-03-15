<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemoveLogoCustomMaskUploadRequest;
use App\Http\Requests\Clipper\ImageRequest;
use App\Models\FFMpeg\Clipper\Image;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\JsonResponse;
use App\Models\FFMpeg\Filters\Video\Removelogo;

class RemovelogoController extends Controller
{
    public function image(ImageRequest $request, string $path): ?Response
    {
        try {
            return ResponseFacade::stream(function () use ($path, $request) {
                echo Image::getLogoMaskData('recordings', $path, $request->input('timestamp'), $request->input('width'), $request->input('height'), $request->input('current_filter'));
            }, 200, [
                "Content-Type" => 'image/png',
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
            Image::createLogoMaskFromDataURL($path, $request->input('image'));
            return response()->json([
                'message' => 'Image uploaded successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function logomask(string $path)
    {
        $imagePath = Image::getLogoMaskFullnameByPath($path);
        return response()->file($imagePath);
    }

    public function deleteMasks(string $path)
    {
        try {
            Removelogo::deleteMasks($path);
            $status = 200;
            $message = 'Masks deleted';
        } catch (\Exception $e) {
            $status = 500;
            $message = sprintf($e->getMessage());
        } finally {
            return response()->json([
                'status' => $status,
                'message' => $message
            ], $status);
        }
    }
}
