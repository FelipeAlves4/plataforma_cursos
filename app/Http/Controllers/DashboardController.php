<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, CourseProgressService $progress): Response
    {
        $user = $request->user();
        $enrollments = Enrollment::query()
            ->with(['course.modules.lessons'])
            ->whereBelongsTo($user)
            ->whereHas('course', fn ($query) => $query->published())
            ->latest('enrolled_at')
            ->get();

        $courses = $enrollments->map(fn (Enrollment $enrollment) => [
            'id' => $enrollment->course->id,
            'title' => $enrollment->course->title,
            'slug' => $enrollment->course->slug,
            'description' => $enrollment->course->description,
            'thumbnailPath' => $enrollment->course->thumbnail_path,
            'progress' => $progress->percentageFor($user, $enrollment->course),
            'lessonCount' => $enrollment->course->lessons->count(),
        ]);
        $courseIds = $enrollments->pluck('course_id');
        $lastProgress = LessonProgress::query()
            ->with('lesson.module.course')
            ->whereBelongsTo($user)
            ->whereNotNull('last_accessed_at')
            ->whereHas('lesson.module.course', fn ($query) => $query->whereKey($courseIds))
            ->latest('last_accessed_at')
            ->first();
        $completedLessonIds = LessonProgress::query()
            ->whereBelongsTo($user)
            ->where('completed', true)
            ->pluck('lesson_id');
        $fallbackLesson = $enrollments
            ->flatMap(fn (Enrollment $enrollment) => $enrollment->course->modules->flatMap->lessons)
            ->first(fn (Lesson $lesson) => ! $completedLessonIds->contains($lesson->id))
            ?? $enrollments->flatMap(fn (Enrollment $enrollment) => $enrollment->course->modules->flatMap->lessons)->first();
        $continueLesson = $lastProgress?->lesson ?? $fallbackLesson;

        return Inertia::render('Dashboard', [
            'courses' => $courses,
            'continueLearning' => $continueLesson ? [
                'lessonId' => $continueLesson->id,
                'lessonTitle' => $continueLesson->title,
                'moduleTitle' => $continueLesson->module->title,
                'courseTitle' => $continueLesson->module->course->title,
                'thumbnailPath' => $continueLesson->module->course->thumbnail_path,
                'progress' => $progress->percentageFor($user, $continueLesson->module->course),
            ] : null,
            'metrics' => [
                'inProgress' => $courses->filter(fn (array $course) => $course['progress'] > 0 && $course['progress'] < 100)->count(),
                'completedCourses' => $courses->where('progress', 100)->count(),
                'completedLessons' => $completedLessonIds->count(),
                'overallProgress' => $courses->isNotEmpty() ? (int) round($courses->avg('progress')) : 0,
            ],
        ]);
    }
}
