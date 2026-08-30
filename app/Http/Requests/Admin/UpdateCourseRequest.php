<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourseStatus;
use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCourseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('title')) {
            $this->merge(['slug' => Str::slug($this->string('title')->toString())]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('courses', 'slug')->ignore($course)],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', 'max:100'],
            'instructor_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::enum(CourseStatus::class)],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:3072'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->input('status') !== CourseStatus::Published->value) {
                return;
            }

            /** @var Course $course */
            $course = $this->route('course');
            $hasValidLesson = $course->lessons()
                ->where(function ($query): void {
                    $query->whereNotNull('video_id')->orWhereNotNull('video_url');
                })
                ->exists();

            if (! $hasValidLesson) {
                $validator->errors()->add('status', 'Adicione pelo menos uma aula antes de publicar o curso.');
            }
        }];
    }
}
