<?php

namespace App\Http\Requests\Admin;

use App\Models\Program;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutLinkRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $name = $this->string('name')->trim()->toString();

        $this->merge(['name' => $name === '' ? null : $name]);
    }

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
            'name' => ['nullable', 'string', 'max:120'],
            'program_id' => ['required', 'integer', Rule::exists(Program::class, 'id')->where('active', true)],
            'price_cents' => ['required', 'integer', 'min:2'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
