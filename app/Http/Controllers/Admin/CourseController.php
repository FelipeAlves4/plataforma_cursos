<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
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
            ->get()
            ->map(fn (Course $course): array => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'status' => $course->status->value,
                'category' => $course->category,
                'thumbnailPath' => $this->mediaStorage->courseCoverUrl($course->thumbnail_path),
                'modulesCount' => $course->modules_count,
                'lessonsCount' => $course->lessons_count,
                'enrollmentsCount' => $course->enrollments_count,
            ]);

        return Inertia::render('Admin/Courses/Index', ['courses' => $courses]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Form');
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $course = Course::query()->create([
            ...$request->safe()->except(['thumbnail', 'status', 'instructor_id']),
            'status' => CourseStatus::Draft,
            'instructor_id' => $request->user()->id,
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
        ]);
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $course->update([
            ...$request->safe()->except(['thumbnail', 'instructor_id']),
            'instructor_id' => $request->user()->id,
        ]);

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
}
