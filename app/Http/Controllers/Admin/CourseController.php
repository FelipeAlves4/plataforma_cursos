<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
use App\Models\User;
use App\Services\MediaStorage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(private MediaStorage $mediaStorage) {}

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
        try {
            $this->storeThumbnail($course, $request);
        } catch (\Throwable) {
            $course->delete();

            return back()->withErrors(['thumbnail' => 'Não foi possível enviar a capa. Tente novamente.'])->withInput();
        }

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
        try {
            $this->storeThumbnail($course, $request);
        } catch (\Throwable) {
            return back()->withErrors(['thumbnail' => 'Não foi possível enviar a capa. Tente novamente.'])->withInput();
        }

        return back()->with('success', 'Curso atualizado.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->mediaStorage->deleteCourseCover($course->thumbnail_path);

        $course->delete();

        return to_route('admin.courses.index')->with('success', 'Curso excluído.');
    }

    private function storeThumbnail(Course $course, StoreCourseRequest|UpdateCourseRequest $request): void
    {
        if (! $request->hasFile('thumbnail')) {
            return;
        }

        $this->mediaStorage->replaceCourseCover($course, $request->file('thumbnail'));
    }

    private function instructors(): array
    {
        return User::query()->where('role', UserRole::Instructor)->orWhere('role', UserRole::Admin)
            ->orderBy('name')->get(['id', 'name'])->all();
    }
}
