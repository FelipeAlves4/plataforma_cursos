<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\CourseProgressService;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Course $course, CourseProgressService $progress): Response
    {
        $enrollments = $course->enrollments()->with('user')->latest('enrolled_at')->get();

        return Inertia::render('Admin/Students/Index', [
            'course' => $course->only('id', 'title', 'slug'),
            'students' => $enrollments->map(fn ($enrollment) => [
                'id' => $enrollment->user->id,
                'name' => $enrollment->user->name,
                'email' => $enrollment->user->email,
                'enrolledAt' => $enrollment->enrolled_at?->toDateTimeString(),
                'progress' => $progress->percentageFor($enrollment->user, $course),
            ]),
        ]);
    }
}
