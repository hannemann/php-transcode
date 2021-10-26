<?php

namespace App\Http\Requests;

use App\Http\Requests\RemuxRequest;
use Illuminate\Validation\Rule;

class ConcatRequest extends RemuxRequest
{
    public function rules(): array
    {
        return [
            'container' => ['required', Rule::in(['ts', 'mp4', 'mkv'])],
            'files' => 'required|array',
            'files.*' => 'required|string',
            'streams' => 'required|array',
            'streams.*' => 'required|int',
            'replaceBlackBorders' => 'required|boolean'
        ];
    }
}
