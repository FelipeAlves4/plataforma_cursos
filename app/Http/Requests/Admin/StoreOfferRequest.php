<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\Program;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists(User::class, 'id')->where('role', UserRole::Student->value),
            ],
            'program_id' => [
                'required',
                'integer',
                Rule::exists(Program::class, 'id')->where('active', true),
            ],
            'price_cents' => ['required', 'integer', 'min:2'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }

    /**
     * Get the custom validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'price_cents.min' => 'O valor da oferta deve ser maior que R$ 0,01.',
        ];
    }
}
