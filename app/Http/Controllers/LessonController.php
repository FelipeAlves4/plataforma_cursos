<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function show(Request $request, Lesson $lesson): Response
    {
        $this->authorize('view', $lesson);

        $lesson->load('module.course.modules.lessons');
        $course = $lesson->module->course;

        LessonProgress::query()->firstOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['started_at' => now()],
        );

        $completedLessonIds = LessonProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('completed', true)
            ->pluck('lesson_id')
            ->all();

        return Inertia::render('Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'videoProvider' => $lesson->video_provider->value,
                'videoId' => $lesson->video_id,
                'videoUrl' => $lesson->video_url,
                'durationSeconds' => $lesson->duration_seconds,
                'completed' => in_array($lesson->id, $completedLessonIds, true),
            ],
            'course' => [
                'title' => $course->title,
                'slug' => $course->slug,
                'modules' => $course->modules->map(fn ($module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'lessons' => $module->lessons->map(fn ($courseLesson) => [
                        'id' => $courseLesson->id,
                        'title' => $courseLesson->title,
                        'completed' => in_array($courseLesson->id, $completedLessonIds, true),
                    ]),
                ]),
            ],
        ]);
    }
}
