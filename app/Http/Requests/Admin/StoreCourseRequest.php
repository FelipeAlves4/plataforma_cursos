<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourseStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('courses', 'slug')],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', 'max:100'],
            'instructor_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::enum(CourseStatus::class)],
            'thumbnail' => ['nullable', 'image', 'max:3072'],
        ];
    }
}
