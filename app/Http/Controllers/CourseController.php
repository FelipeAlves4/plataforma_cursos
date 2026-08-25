<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LessonProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function show(Request $request, Course $course, CourseProgressService $progress): Response
    {
        $this->authorize('view', $course);

        $course->load('modules.lessons');
        $completedLessonIds = LessonProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('completed', true)
            ->pluck('lesson_id')
            ->all();

        return Inertia::render('Courses/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'thumbnailPath' => $course->thumbnail_path,
                'progress' => $progress->percentageFor($request->user(), $course),
                'modules' => $course->modules->map(fn ($module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'position' => $module->position,
                    'lessons' => $module->lessons->map(fn ($lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'durationSeconds' => $lesson->duration_seconds,
                        'isPreview' => $lesson->is_preview,
                        'completed' => in_array($lesson->id, $completedLessonIds, true),
                    ]),
                ]),
            ],
        ]);
    }
}
