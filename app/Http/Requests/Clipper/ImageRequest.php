<?php

namespace App\Http\Requests\Clipper;

use Illuminate\Foundation\Http\FormRequest;

class ImageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'timestamp' => ['required', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'width' => 'nullable|integer',
            'height' => 'nullable|integer',
        ];
    }
}