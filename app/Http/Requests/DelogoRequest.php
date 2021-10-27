<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class DelogoRequest extends FFMpegActionRequest
{
    public function rules()
    {
        $rules = [
            'x' => 'required|int',
            'y' => 'required|int',
            'w' => 'required|int',
            'h' => 'required|int',
            'type' => ['required', Rule::in(['cpu', 'vaapi'])],
        ];
        return $rules;
    }
}
