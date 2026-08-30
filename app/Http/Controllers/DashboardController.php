<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Services\CourseProgressService;
use App\Services\MediaStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private MediaStorage $mediaStorage) {}

    public function __invoke(Request $request, CourseProgressService $progress): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $enrollments = Enrollment::query()
            ->with(['course.modules.lessons'])
            ->whereBelongsTo($user)
            ->whereHas('course', fn ($query) => $query->published())
            ->latest('enrolled_at')
            ->get();

        $enrolledCourses = $enrollments->pluck('course');
        $courseProgress = $progress->percentagesFor($user, $enrolledCourses);
        $courses = $enrolledCourses->map(fn (Course $course) => $this->courseData($course, $courseProgress[$course->id] ?? 0));
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
        $fallbackLesson = $enrolledCourses
            ->flatMap(fn (Course $course) => $course->modules->flatMap->lessons)
            ->first(fn (Lesson $lesson) => ! $completedLessonIds->contains($lesson->id))
            ?? $enrolledCourses->flatMap(fn (Course $course) => $course->modules->flatMap->lessons)->first();
        $continueLesson = $lastProgress?->lesson ?? $fallbackLesson;
        $recommendedCourses = Course::query()
            ->published()
            ->whereNotIn('id', $courseIds)
            ->with('modules.lessons')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (Course $course) => $this->courseData($course, 0, false));

        return Inertia::render('Dashboard', [
            'courses' => $courses,
            'continueLearning' => $continueLesson ? [
                'lessonId' => $continueLesson->id,
                'lessonTitle' => $continueLesson->title,
                'moduleTitle' => $continueLesson->module->title,
                'courseTitle' => $continueLesson->module->course->title,
                'courseSlug' => $continueLesson->module->course->slug,
                'thumbnailPath' => $this->mediaStorage->courseCoverUrl($continueLesson->module->course->thumbnail_path),
                'progress' => $courseProgress[$continueLesson->module->course->id] ?? 0,
            ] : null,
            'featuredCourses' => $courses->take(2)->values(),
            'newCourses' => $recommendedCourses->take(2)->values(),
            'recommendedCourses' => $recommendedCourses,
            'metrics' => [
                'inProgress' => $courses->filter(fn (array $course) => $course['progress'] > 0 && $course['progress'] < 100)->count(),
                'completedCourses' => $courses->where('progress', 100)->count(),
                'completedLessons' => $completedLessonIds->count(),
                'overallProgress' => $courses->isNotEmpty() ? (int) round($courses->avg('progress')) : 0,
            ],
        ]);
    }

    /** @return array<string, int|string|null|bool> */
    private function courseData(Course $course, int $courseProgress, bool $enrolled = true): array
    {
        $lessons = $course->modules->flatMap->lessons;

        return [
            'id' => $course->id,
            'title' => $course->title,
            'slug' => $course->slug,
            'description' => $course->description,
            'thumbnailPath' => $this->mediaStorage->courseCoverUrl($course->thumbnail_path),
            'category' => $course->category,
            'level' => $course->level,
            'progress' => $courseProgress,
            'lessonCount' => $lessons->count(),
            'moduleCount' => $course->modules->count(),
            'durationMinutes' => $course->estimated_duration_minutes ?: (int) ceil($lessons->sum('duration_seconds') / 60),
            'enrolled' => $enrolled,
        ];
    }
}
