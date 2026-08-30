<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(private CourseProgressService $courseProgress) {}

    public function isEligible(User $user, Course $course): bool
    {
        if (! $course->certificate_enabled || ! $course->enrollments()->whereBelongsTo($user)->exists()) {
            return false;
        }

        $totalLessons = $course->lessons()->count();

        if ($totalLessons === 0) {
            return false;
        }

        $completedLessons = LessonProgress::query()
            ->whereBelongsTo($user)
            ->where('completed', true)
            ->whereHas('lesson.module', fn ($query) => $query->where('course_id', $course->id))
            ->count();

        return $completedLessons === $totalLessons;
    }

    public function findOrIssue(User $user, Course $course): ?Certificate
    {
        $existingCertificate = Certificate::query()
            ->whereBelongsTo($user)
            ->whereBelongsTo($course)
            ->first();

        if ($existingCertificate) {
            return $existingCertificate;
        }

        if (! $this->isEligible($user, $course)) {
            return null;
        }

        return $this->issue($user, $course);
    }

    public function issue(User $user, Course $course): ?Certificate
    {
        return DB::transaction(function () use ($user, $course): ?Certificate {
            Enrollment::query()
                ->whereBelongsTo($user)
                ->whereBelongsTo($course)
                ->lockForUpdate()
                ->firstOrFail();

            $existingCertificate = Certificate::query()
                ->whereBelongsTo($user)
                ->whereBelongsTo($course)
                ->first();

            if ($existingCertificate) {
                return $existingCertificate;
            }

            $course->loadMissing('instructor');

            if (! $this->isEligible($user, $course)) {
                return null;
            }

            return Certificate::query()->create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'verification_code' => (string) Str::ulid(),
                'certificate_number' => $this->certificateNumber(),
                'recipient_name' => $user->name,
                'course_title' => $course->title,
                'instructor_name' => $course->instructor?->name,
                'workload_minutes' => $course->estimated_duration_minutes,
                'completed_at' => $this->completionDate($user, $course),
                'issued_at' => now(),
            ]);
        });
    }

    /**
     * @return Collection<int, Course>
     */
    public function eligibleCourses(User $user): Collection
    {
        $courses = $user->enrollments()
            ->with('course')
            ->get()
            ->pluck('course')
            ->filter()
            ->values();
        $details = $this->courseProgress->detailsFor($user, $courses);
        $issuedCourseIds = $user->certificates()->whereNotNull('course_id')->pluck('course_id');

        return $courses->filter(function (Course $course) use ($details, $issuedCourseIds): bool {
            $progress = $details[$course->id] ?? null;

            return $course->certificate_enabled
                && ! $issuedCourseIds->contains($course->id)
                && $progress !== null
                && $progress['totalLessons'] > 0
                && $progress['completedLessons'] === $progress['totalLessons'];
        })->values();
    }

    private function completionDate(User $user, Course $course): Carbon
    {
        $completedAt = LessonProgress::query()
            ->whereBelongsTo($user)
            ->where('completed', true)
            ->whereHas('lesson.module', fn ($query) => $query->where('course_id', $course->id))
            ->latest('completed_at')
            ->value('completed_at');

        return $completedAt ? Carbon::parse($completedAt) : now();
    }

    private function certificateNumber(): string
    {
        do {
            $number = sprintf('ASEX-%s-%s', now()->format('Y'), Str::upper(Str::random(8)));
        } while (Certificate::query()->where('certificate_number', $number)->exists());

        return $number;
    }
}
