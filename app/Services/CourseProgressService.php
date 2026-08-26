<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CourseProgressService
{
    /**
     * @param  Collection<int, Course>  $courses
     * @return array<int, int>
     */
    public function percentagesFor(User $user, Collection $courses): array
    {
        $courseIds = $courses->pluck('id')->all();

        if ($courseIds === []) {
            return [];
        }

        $modulesTable = (new CourseModule)->getTable();
        $lessonsTable = (new Lesson)->getTable();
        $progressTable = (new LessonProgress)->getTable();
        $lessonCounts = Course::query()
            ->whereKey($courseIds)
            ->withCount('lessons')
            ->pluck('lessons_count', 'id');
        $completedCounts = LessonProgress::query()
            ->select("{$modulesTable}.course_id", DB::raw('count(*) as completed_lessons'))
            ->join($lessonsTable, "{$progressTable}.lesson_id", '=', "{$lessonsTable}.id")
            ->join($modulesTable, "{$lessonsTable}.module_id", '=', "{$modulesTable}.id")
            ->where("{$progressTable}.user_id", $user->id)
            ->where("{$progressTable}.completed", true)
            ->whereIn("{$modulesTable}.course_id", $courseIds)
            ->groupBy("{$modulesTable}.course_id")
            ->pluck('completed_lessons', "{$modulesTable}.course_id");

        return collect($courseIds)->mapWithKeys(function (int $courseId) use ($lessonCounts, $completedCounts): array {
            $totalLessons = $lessonCounts[$courseId] ?? 0;

            return [$courseId => $totalLessons > 0
                ? (int) round((($completedCounts[$courseId] ?? 0) / $totalLessons) * 100)
                : 0];
        })->all();
    }

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
