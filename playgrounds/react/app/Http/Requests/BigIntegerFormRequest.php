<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BigIntegerFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The integer rule is the interesting one. It only passes because the
     * middleware revived the marker before validation ran, and it fails for
     * digits beyond PHP_INT_MAX, which cannot become a native integer here.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', 'min:1'],
            'reference' => ['required', 'string', 'min:3'],
        ];
    }
}
