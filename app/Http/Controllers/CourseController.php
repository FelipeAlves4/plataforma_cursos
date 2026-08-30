<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LessonProgress;
use App\Services\CourseProgressService;
use App\Services\MediaStorage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(private MediaStorage $mediaStorage) {}

    public function index(Request $request, CourseProgressService $progress): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', 'string', 'max:100'],
        ]);
        $user = $request->user();
        $query = Course::query()->published()->with(['instructor', 'modules.lessons'])->withCount('lessons');

        $query->when($filters['search'] ?? null, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($filters['category'] ?? null, fn ($q, $category) => $q->where('category', $category))
            ->when($filters['level'] ?? null, fn ($q, $level) => $q->where('level', $level));

        $enrolledIds = $user->enrollments()->pluck('course_id')->all();
        $courseCollection = $query->latest()->get();
        $enrolledCourses = $courseCollection->whereIn('id', $enrolledIds);
        $courseProgress = $progress->percentagesFor($user, $enrolledCourses);
        $courses = $courseCollection->map(function (Course $course) use ($enrolledIds, $courseProgress): array {
            $enrolled = in_array($course->id, $enrolledIds, true);
            $percentage = $enrolled ? ($courseProgress[$course->id] ?? 0) : 0;
            $status = ! $enrolled ? 'available' : ($percentage === 100 ? 'completed' : ($percentage > 0 ? 'in_progress' : 'not_started'));

            return [
                'id' => $course->id, 'title' => $course->title, 'slug' => $course->slug,
                'description' => $course->description, 'thumbnailPath' => $this->mediaStorage->courseCoverUrl($course->thumbnail_path),
                'category' => $course->category, 'level' => $course->level,
                'instructor' => $course->instructor?->name, 'lessonCount' => $course->lessons_count,
                'durationMinutes' => $course->estimated_duration_minutes,
                'enrolled' => $enrolled, 'progress' => $percentage, 'status' => $status,
            ];
        })->values();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'filters' => $filters,
            'categories' => Course::query()->published()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
            'levels' => Course::query()->published()->whereNotNull('level')->distinct()->orderBy('level')->pluck('level')->values(),
        ]);
    }

    public function myCourses(Request $request, CourseProgressService $progress): Response
    {
        $enrolledCourses = $request->user()->enrollments()
            ->with(['course.instructor', 'course.modules.lessons'])
            ->whereHas('course', fn ($query) => $query->published())
            ->latest('enrolled_at')
            ->get()
            ->pluck('course')
            ->values();
        $courseProgress = $progress->detailsFor($request->user(), $enrolledCourses);

        return Inertia::render('Courses/MyCourses', [
            'courses' => $enrolledCourses->map(function (Course $course) use ($courseProgress): array {
                $details = $courseProgress[$course->id] ?? ['completedLessons' => 0, 'totalLessons' => 0, 'percentage' => 0];
                $status = $details['percentage'] === 100 ? 'completed' : ($details['percentage'] > 0 ? 'in_progress' : 'not_started');

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'thumbnailPath' => $this->mediaStorage->courseCoverUrl($course->thumbnail_path),
                    'lessonCount' => $details['totalLessons'],
                    'completedLessonCount' => $details['completedLessons'],
                    'progress' => $details['percentage'],
                    'status' => $status,
                ];
            }),
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
                'thumbnailPath' => $this->mediaStorage->courseCoverUrl($course->thumbnail_path),
                'progress' => $progress->percentageFor($request->user(), $course),
                'category' => $course->category,
                'level' => $course->level,
                'instructor' => $course->instructor?->name,
                'durationMinutes' => $course->estimated_duration_minutes ?: (int) ceil($course->lessons->sum('duration_seconds') / 60),
                'lessonCount' => $course->lessons->count(),
                'moduleCount' => $course->modules->count(),
                'nextLessonId' => $nextLesson?->id,
                'modules' => $course->modules->map(fn ($module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'position' => $module->position,
                    'completedLessons' => $module->lessons->whereIn('id', $completedLessonIds)->count(),
                    'lessons' => $module->lessons->map(fn ($lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'durationSeconds' => $lesson->duration_seconds,
                        'videoId' => $lesson->video_id,
                        'isPreview' => $lesson->is_preview,
                        'completed' => in_array($lesson->id, $completedLessonIds, true),
                    ]),
                ]),
            ],
        ]);
    }
}
