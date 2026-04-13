<?php

namespace App\Http\Requests;

class PlayerRequest extends TranscodeRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = parent::rules();
        $rules['startTime'] = ['nullable', 'regex:/^([0-9]+:)?[0-9]+:[0-9]+:[0-9]+\.[0-9]+$/'];
        return $rules;
    }
}
