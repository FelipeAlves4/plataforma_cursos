<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Services\CourseProgressService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StudentDirectoryController extends Controller
{
    public function index(CourseProgressService $progress): Response
    {
        $students = User::query()
            ->where('role', UserRole::Student)
            ->with(['enrollments.course.modules.lessons', 'lessonProgress'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Students/Directory', [
            'students' => $students->map(function (User $student) use ($progress): array {
                $courses = $student->enrollments->pluck('course')->filter()->values();
                $details = $progress->detailsFor($student, $courses);
                $percentages = collect($details)->pluck('percentage');
                $lastActivityAt = $this->lastActivityAt($student);

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'courseCount' => $courses->count(),
                    'completedCourses' => $percentages->filter(fn (int $percentage): bool => $percentage === 100)->count(),
                    'averageProgress' => $percentages->isNotEmpty() ? (int) round($percentages->avg()) : 0,
                    'lastActivityAt' => $lastActivityAt?->toDateTimeString(),
                    'status' => $this->statusFor($courses, $lastActivityAt),
                ];
            })->values(),
        ]);
    }

    public function show(User $student, CourseProgressService $progress): Response
    {
        abort_unless($student->role === UserRole::Student, 404);

        $student->load([
            'enrollments.course.modules.lessons',
            'lessonProgress.lesson.module',
        ]);

        $courses = $student->enrollments->pluck('course')->filter()->values();
        $details = $progress->detailsFor($student, $courses);
        $progressByCourse = $student->lessonProgress
            ->filter(fn ($lessonProgress): bool => $lessonProgress->lesson?->module?->course_id !== null)
            ->groupBy(fn ($lessonProgress): int => (int) $lessonProgress->lesson->module->course_id);
        $lastActivityAt = $this->lastActivityAt($student);
        $percentages = collect($details)->pluck('percentage');

        return Inertia::render('Admin/Students/Show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'phone' => $student->phone,
                'company' => $student->company,
                'jobTitle' => $student->job_title,
                'createdAt' => $student->created_at?->toDateTimeString(),
                'lastActivityAt' => $lastActivityAt?->toDateTimeString(),
                'status' => $this->statusFor($courses, $lastActivityAt),
                'courseCount' => $courses->count(),
                'completedCourses' => $percentages->filter(fn (int $percentage): bool => $percentage === 100)->count(),
                'averageProgress' => $percentages->isNotEmpty() ? (int) round($percentages->avg()) : 0,
            ],
            'courses' => $student->enrollments
                ->filter(fn ($enrollment): bool => $enrollment->course !== null)
                ->map(function ($enrollment) use ($details, $progressByCourse): array {
                    $course = $enrollment->course;
                    $courseDetails = $details[$course->id] ?? ['completedLessons' => 0, 'totalLessons' => 0, 'percentage' => 0];
                    $courseProgress = $progressByCourse->get($course->id, collect());
                    $lastActivity = $courseProgress
                        ->filter(fn ($item): bool => $item->last_accessed_at !== null)
                        ->sortByDesc(fn ($item): int => $item->last_accessed_at?->timestamp ?? 0)
                        ->first()?->last_accessed_at;

                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'slug' => $course->slug,
                        'enrollmentId' => $enrollment->id,
                        'enrolledAt' => $enrollment->enrolled_at?->toDateTimeString(),
                        'completedLessons' => $courseDetails['completedLessons'],
                        'lessonCount' => $courseDetails['totalLessons'],
                        'progress' => $courseDetails['percentage'],
                        'lastActivityAt' => $lastActivity?->toDateTimeString(),
                        'status' => match (true) {
                            $courseDetails['percentage'] === 100 => 'Concluído',
                            $lastActivity === null => 'Não iniciado',
                            $lastActivity->lt(now()->subDays(30)) => 'Inativo',
                            default => 'Em andamento',
                        },
                    ];
                })
                ->values(),
            'availableCourses' => Course::query()
                ->published()
                ->whereNotIn('id', $courses->pluck('id'))
                ->orderBy('title')
                ->get(['id', 'title']),
        ]);
    }

    private function lastActivityAt(User $student): ?Carbon
    {
        $activity = $student->lessonProgress
            ->filter(fn ($progress): bool => $progress->last_accessed_at !== null)
            ->sortByDesc(fn ($progress): int => $progress->last_accessed_at?->timestamp ?? 0)
            ->first()?->last_accessed_at;

        return $activity instanceof Carbon ? $activity : ($activity ? Carbon::parse($activity) : null);
    }

    /** @param Collection<int, Course> $courses */
    private function statusFor(Collection $courses, ?Carbon $lastActivityAt): string
    {
        if ($courses->isEmpty()) {
            return 'Sem matrícula';
        }

        if ($lastActivityAt === null) {
            return 'Não iniciou';
        }

        return $lastActivityAt->lt(now()->subDays(30)) ? 'Inativo' : 'Ativo';
    }
}
