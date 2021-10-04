<?php

namespace App\Http\Requests;

use App\Http\Requests\TranscodeRequest;
use Illuminate\Validation\Rule;

class RemuxRequest extends TranscodeRequest
{
    public function rules()
    {
        $rules = parent::rules();
        $rules['container'] = ['required', Rule::in(['ts', 'mp4', 'mkv'])];
        return $rules;
    }
}
