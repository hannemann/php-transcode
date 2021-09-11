<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TranscodeRequest extends FormRequest
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
            'streams'       => 'required|array',
            'streams.*'     => 'integer',
            'clips'         => 'required|array',
            'clips.*'       => 'array',
            'clips.*.to'    => ['nullable', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'clips.*.from'  => ['nullable', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'],
            'clips.*.id'    => 'required|integer',
        ];
    }
}
