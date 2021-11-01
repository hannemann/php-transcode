<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TranscodeRequest extends FFMpegActionRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'streams'                   => 'required|array',
            'streams.*'                 => 'required|array',
            'streams.*.id'              => 'required|integer',
            'streams.*.config'          => 'nullable|array',
            'streams.*.config.codec'    => 'nullable|integer',
            'streams.*.config.qp'       => 'nullable|integer',
            'streams.*.config.channels' => 'nullable|integer',
            'streams.*.config.aspect'   => ['nullable', Rule::in(['4:3', '16:9', 'Keep'])],
            'clips'                     => 'required|array',
            'clips.*'                   => 'array',
            'clips.*.to'                => ['nullable', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'clips.*.from'              => ['nullable', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'clips.*.id'                => 'required|integer',
        ];
    }
}
