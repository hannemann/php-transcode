<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class RemovelogoRequest extends FFMpegActionRequest
{
    public function rules()
    {
        $rules = [
            'timestamp'   => ['required', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'w'    => 'required|integer',
            'h'    => 'required|integer',
            'type' => ['required', Rule::in(['cpu', 'vaapi'])],
        ];
        return $rules;
    }
}
