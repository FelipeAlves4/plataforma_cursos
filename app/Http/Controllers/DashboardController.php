<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, CourseProgressService $progress): Response
    {
        $enrollments = Enrollment::query()
            ->with(['course.modules.lessons'])
            ->where('user_id', $request->user()->id)
            ->latest('enrolled_at')
            ->get();

        $courses = $enrollments->map(fn (Enrollment $enrollment) => [
            'id' => $enrollment->course->id,
            'title' => $enrollment->course->title,
            'slug' => $enrollment->course->slug,
            'description' => $enrollment->course->description,
            'thumbnailPath' => $enrollment->course->thumbnail_path,
            'progress' => $progress->percentageFor($request->user(), $enrollment->course),
            'lessonCount' => $enrollment->course->lessons->count(),
        ]);
        $lastProgress = LessonProgress::query()->with('lesson.module.course')
            ->where('user_id', $request->user()->id)->whereNotNull('last_accessed_at')->latest('last_accessed_at')->first();

        return Inertia::render('Dashboard', [
            'courses' => $courses,
            'continueLearning' => $lastProgress ? [
                'lessonId' => $lastProgress->lesson_id,
                'lessonTitle' => $lastProgress->lesson->title,
                'moduleTitle' => $lastProgress->lesson->module->title,
                'courseTitle' => $lastProgress->lesson->module->course->title,
                'thumbnailPath' => $lastProgress->lesson->module->course->thumbnail_path,
                'progress' => $progress->percentageFor($request->user(), $lastProgress->lesson->module->course),
            ] : null,
            'metrics' => [
                'inProgress' => $courses->filter(fn (array $course) => $course['progress'] > 0 && $course['progress'] < 100)->count(),
                'completedCourses' => $courses->where('progress', 100)->count(),
                'completedLessons' => LessonProgress::query()->where('user_id', $request->user()->id)->where('completed', true)->count(),
                'overallProgress' => $courses->isNotEmpty() ? (int) round($courses->avg('progress')) : 0,
            ],
        ]);
    }
}
