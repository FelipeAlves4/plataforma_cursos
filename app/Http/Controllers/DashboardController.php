<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, CourseProgressService $progress): Response
    {
        $enrollments = Enrollment::query()
            ->with(['course.modules.lessons'])
            ->where('user_id', $request->user()->id)
            ->latest('enrolled_at')
            ->get();

        return Inertia::render('Dashboard', [
            'courses' => $enrollments->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->course->id,
                'title' => $enrollment->course->title,
                'slug' => $enrollment->course->slug,
                'description' => $enrollment->course->description,
                'thumbnailPath' => $enrollment->course->thumbnail_path,
                'progress' => $progress->percentageFor($request->user(), $enrollment->course),
                'lessonCount' => $enrollment->course->lessons->count(),
            ]),
        ]);
    }
}
