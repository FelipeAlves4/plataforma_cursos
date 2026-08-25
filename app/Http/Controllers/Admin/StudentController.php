<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\CourseProgressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'enrollmentId' => $enrollment->id,
                'id' => $enrollment->user->id,
                'name' => $enrollment->user->name,
                'email' => $enrollment->user->email,
                'enrolledAt' => $enrollment->enrolled_at?->toDateTimeString(),
                'progress' => $progress->percentageFor($enrollment->user, $course),
            ]),
            'availableStudents' => User::query()->where('role', 'STUDENT')->whereNotIn('id', $enrollments->pluck('user_id'))->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);
        $student = User::query()->findOrFail($data['user_id']);
        abort_unless($student->role->value === 'STUDENT', 422);
        Enrollment::query()->firstOrCreate(['user_id' => $student->id, 'course_id' => $course->id], ['enrolled_at' => now()]);

        return back()->with('success', 'Aluno matriculado.');
    }

    public function destroy(Course $course, Enrollment $enrollment): RedirectResponse
    {
        abort_unless($enrollment->course_id === $course->id, 404);
        $enrollment->delete();

        return back()->with('success', 'Matrícula removida.');
    }
}
