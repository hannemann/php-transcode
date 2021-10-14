<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ScaleRequest extends FFMpegActionRequest
{
    public function rules()
    {
        $rules = [
            'width' => 'required|int',
            'height' => 'required|int',
            'aspect' => ['required', Rule::in(['4:3', '16:9'])],
            'type' => ['required', Rule::in(['vaapi', 'cpu'])],
        ];
        return $rules;
    }
}
