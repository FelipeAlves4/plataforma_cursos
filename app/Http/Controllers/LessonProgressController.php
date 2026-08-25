<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LessonProgressController extends Controller
{
    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->authorize('view', $lesson);

        $data = $request->validate([
            'completed' => ['required', 'boolean'],
            'last_position_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $progress = LessonProgress::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->started_at ??= now();
        $progress->last_accessed_at = now();
        $progress->completed = $data['completed'];
        $progress->last_position_seconds = $data['last_position_seconds'] ?? $progress->last_position_seconds;
        $progress->completed_at = $data['completed'] ? ($progress->completed_at ?? now()) : null;
        $progress->save();

        return back();
    }
}
