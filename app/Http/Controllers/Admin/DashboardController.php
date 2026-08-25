<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalLessons = Lesson::query()->count();
        $completedLessons = LessonProgress::query()->where('completed', true)->count();

        return Inertia::render('Admin/Dashboard', ['metrics' => [
            'students' => User::query()->where('role', 'STUDENT')->count(),
            'courses' => Course::query()->count(),
            'publishedCourses' => Course::query()->where('status', CourseStatus::Published)->count(),
            'lessons' => $totalLessons,
            'enrollments' => Enrollment::query()->count(),
            'averageCompletion' => $totalLessons > 0 ? (int) round(($completedLessons / $totalLessons) * 100) : 0,
        ]]);
    }
}
