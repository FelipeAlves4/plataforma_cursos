<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoursePreviewController extends Controller
{
    public function __invoke(Request $request, Course $course): Response
    {
        $data = $request->validate([
            'lesson' => ['nullable', 'integer'],
        ]);

        $course->load(['instructor', 'modules.lessons']);
        $orderedLessons = $course->modules->flatMap->lessons->values();
        $lesson = isset($data['lesson'])
            ? $orderedLessons->firstWhere('id', $data['lesson'])
            : $orderedLessons->first();

        abort_unless($lesson, 404);

        $position = $orderedLessons->search(fn ($item) => $item->id === $lesson->id);

        return Inertia::render('Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'videoProvider' => $lesson->video_provider->value,
                'videoId' => $lesson->video_id,
                'videoUrl' => $lesson->video_url,
                'durationSeconds' => $lesson->duration_seconds,
                'completed' => false,
                'number' => $position + 1,
            ],
            'course' => [
                'title' => $course->title,
                'slug' => $course->slug,
                'instructor' => $course->instructor?->name,
                'category' => $course->category,
                'level' => $course->level,
                'progress' => [
                    'completedLessons' => 0,
                    'totalLessons' => $orderedLessons->count(),
                    'percentage' => 0,
                ],
                'modules' => $course->modules->map(fn ($module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'position' => $module->position,
                    'lessons' => $module->lessons->map(fn ($courseLesson) => [
                        'id' => $courseLesson->id,
                        'title' => $courseLesson->title,
                        'videoId' => $courseLesson->video_id,
                        'durationSeconds' => $courseLesson->duration_seconds,
                        'completed' => false,
                        'number' => $orderedLessons->search(fn ($item) => $item->id === $courseLesson->id) + 1,
                    ]),
                ]),
            ],
            'navigation' => [
                'previousLessonId' => $orderedLessons->get($position - 1)?->id,
                'nextLessonId' => $orderedLessons->get($position + 1)?->id,
            ],
            'preview' => [
                'returnUrl' => route('admin.courses.edit', $course),
                'baseUrl' => route('admin.courses.preview', $course),
            ],
        ]);
    }
}
