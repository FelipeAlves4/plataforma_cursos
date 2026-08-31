<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourseStatus;
use App\Models\Course;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProgramRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'audience' => ['nullable', 'string', 'max:255'],
            'default_price_cents' => ['required', 'integer', 'min:0'],
            'active' => ['required', 'boolean'],
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(Course::class, 'id')->where('status', CourseStatus::Published->value),
            ],
        ];
    }
}
