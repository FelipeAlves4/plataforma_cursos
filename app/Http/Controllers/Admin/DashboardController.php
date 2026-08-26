<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'students' => User::query()->where('role', UserRole::Student)->count(),
                'courses' => Course::query()->count(),
                'publishedCourses' => Course::query()->where('status', CourseStatus::Published)->count(),
                'draftCourses' => Course::query()->where('status', CourseStatus::Draft)->count(),
                'lessons' => Lesson::query()->count(),
                'enrollments' => Enrollment::query()->count(),
            ],
            'recentCourses' => Course::query()
                ->withCount(['lessons', 'enrollments'])
                ->latest('updated_at')
                ->limit(5)
                ->get()
                ->map(fn (Course $course): array => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'status' => $course->status->value,
                    'lessonsCount' => $course->lessons_count,
                    'enrollmentsCount' => $course->enrollments_count,
                ]),
            'recentEnrollments' => Enrollment::query()
                ->with(['course:id,title', 'user:id,name,email'])
                ->latest('enrolled_at')
                ->limit(5)
                ->get()
                ->map(fn (Enrollment $enrollment): array => [
                    'id' => $enrollment->id,
                    'enrolledAt' => $enrollment->enrolled_at?->toDateTimeString(),
                    'course' => [
                        'id' => $enrollment->course->id,
                        'title' => $enrollment->course->title,
                    ],
                    'student' => [
                        'name' => $enrollment->user->name,
                        'email' => $enrollment->user->email,
                    ],
                ]),
        ]);
    }
}
