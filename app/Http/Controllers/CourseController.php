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
    public function index(Request $request, CourseProgressService $progress): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:not_started,in_progress,completed'],
        ]);
        $user = $request->user();
        $query = Course::query()->published()->with(['instructor'])->withCount('lessons');

        $query->when($filters['search'] ?? null, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($filters['category'] ?? null, fn ($q, $category) => $q->where('category', $category))
            ->when($filters['level'] ?? null, fn ($q, $level) => $q->where('level', $level));

        $enrolledIds = $user->enrollments()->pluck('course_id')->all();
        $courses = $query->latest()->get()->map(function (Course $course) use ($user, $progress, $enrolledIds): array {
            $percentage = in_array($course->id, $enrolledIds, true) ? $progress->percentageFor($user, $course) : 0;
            $status = $percentage === 100 ? 'completed' : ($percentage > 0 ? 'in_progress' : 'not_started');

            return [
                'id' => $course->id, 'title' => $course->title, 'slug' => $course->slug,
                'description' => $course->description, 'thumbnailPath' => $course->thumbnail_path,
                'category' => $course->category, 'level' => $course->level,
                'instructor' => $course->instructor?->name, 'lessonCount' => $course->lessons_count,
                'durationMinutes' => $course->estimated_duration_minutes,
                'enrolled' => in_array($course->id, $enrolledIds, true), 'progress' => $percentage, 'status' => $status,
            ];
        })->when($filters['status'] ?? null, fn ($items, $status) => $items->where('status', $status))->values();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'filters' => $filters,
            'categories' => Course::query()->published()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
            'levels' => Course::query()->published()->whereNotNull('level')->distinct()->orderBy('level')->pluck('level')->values(),
        ]);
    }

    public function show(Request $request, Course $course, CourseProgressService $progress): Response
    {
        $this->authorize('view', $course);

        $course->load(['modules.lessons', 'instructor']);
        $completedLessonIds = LessonProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('completed', true)
            ->pluck('lesson_id')
            ->all();

        $nextLesson = $course->modules->flatMap->lessons->first(fn ($lesson) => ! in_array($lesson->id, $completedLessonIds, true))
            ?? $course->modules->flatMap->lessons->first();

        return Inertia::render('Courses/Show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'thumbnailPath' => $course->thumbnail_path,
                'progress' => $progress->percentageFor($request->user(), $course),
                'category' => $course->category,
                'level' => $course->level,
                'instructor' => $course->instructor?->name,
                'durationMinutes' => $course->estimated_duration_minutes ?: (int) ceil($course->lessons->sum('duration_seconds') / 60),
                'nextLessonId' => $nextLesson?->id,
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
