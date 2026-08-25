<?php

namespace App\Services;

use App\Models\Course;
use App\Models\LessonProgress;
use App\Models\User;

class CourseProgressService
{
    public function percentageFor(User $user, Course $course): int
    {
        $totalLessons = $course->lessons()->count();

        if ($totalLessons === 0) {
            return 0;
        }

        $completedLessons = LessonProgress::query()
            ->where('user_id', $user->id)
            ->where('completed', true)
            ->whereHas('lesson.module', fn ($query) => $query->where('course_id', $course->id))
            ->count();

        return (int) round(($completedLessons / $totalLessons) * 100);
    }
}
