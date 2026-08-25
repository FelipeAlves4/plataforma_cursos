<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        $courses = Course::query()->published()->withCount('lessons')->latest()->take(3)->get();

        return Inertia::render('Welcome', ['courses' => $courses->map(fn (Course $course) => [
            'id' => $course->id,
            'title' => $course->title,
            'slug' => $course->slug,
            'description' => $course->description,
            'thumbnailPath' => $course->thumbnail_path,
            'category' => $course->category,
            'level' => $course->level,
            'lessonCount' => $course->lessons_count,
        ])]);
    }
}
