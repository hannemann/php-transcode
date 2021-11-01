<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CropRequest extends FFMpegActionRequest
{
    public function rules()
    {
        $rules = [
            'cw' => 'required|int',
            'ch' => 'required|int',
            'cx' => 'required|int',
            'cy' => 'required|int',
            'height' => 'required|int',
            'aspect' => ['required', 'regex:/[0-9]+:[0-9]+/'],
            'type' => ['required', Rule::in(['cpu', 'vaapi'])],
            'mirror' => 'required|boolean',
        ];
        return $rules;
    }
}
