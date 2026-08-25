<?php

namespace App\Http\Requests\Admin;

use App\Enums\VideoProvider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'video_provider' => ['required', Rule::enum(VideoProvider::class)],
            'video_id' => ['nullable', 'string', 'max:255', 'required_without:video_url'],
            'video_url' => ['nullable', 'url', 'max:2048', 'required_without:video_id'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'position' => ['required', 'integer', 'min:1'],
            'is_preview' => ['required', 'boolean'],
        ];
    }
}
