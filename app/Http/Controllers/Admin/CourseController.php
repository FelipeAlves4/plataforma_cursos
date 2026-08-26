<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::query()
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Courses/Index', ['courses' => $courses]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Form', ['instructors' => $this->instructors()]);
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $course = Course::query()->create([
            ...$request->safe()->except(['thumbnail', 'status']),
            'status' => CourseStatus::Draft,
        ]);
        $this->storeThumbnail($course, $request);

        return to_route('admin.courses.edit', $course)->with('success', 'Curso criado.');
    }

    public function edit(Course $course): Response
    {
        return Inertia::render('Admin/Courses/Form', [
            'course' => $course->load('modules.lessons'),
            'instructors' => $this->instructors(),
        ]);
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $course->update($request->safe()->except('thumbnail'));
        $this->storeThumbnail($course, $request);

        return back()->with('success', 'Curso atualizado.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        if ($course->thumbnail_path) {
            Storage::disk('public')->delete($course->thumbnail_path);
        }

        $course->delete();

        return to_route('admin.courses.index')->with('success', 'Curso excluído.');
    }

    private function storeThumbnail(Course $course, StoreCourseRequest|UpdateCourseRequest $request): void
    {
        if (! $request->hasFile('thumbnail')) {
            return;
        }

        if ($course->thumbnail_path) {
            Storage::disk('public')->delete($course->thumbnail_path);
        }

        $course->update([
            'thumbnail_path' => $request->file('thumbnail')->store("courses/{$course->id}", 'public'),
        ]);
    }

    private function instructors(): array
    {
        return User::query()->where('role', UserRole::Instructor)->orWhere('role', UserRole::Admin)
            ->orderBy('name')->get(['id', 'name'])->all();
    }
}
