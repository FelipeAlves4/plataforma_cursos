<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\VideoProvider;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourseCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_my_courses_only_returns_published_courses_in_the_students_library(): void
    {
        $student = User::factory()->create();
        $startedCourse = $this->course('Curso em andamento', 'curso-em-andamento', 'Gestão', 'Iniciante', 2);
        $completedCourse = $this->course('Curso concluído', 'curso-concluido', 'Operação', 'Intermediário', 1);
        $otherCourse = $this->course('Curso de outro aluno', 'curso-de-outro-aluno', 'Finanças', 'Avançado', 1);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $startedCourse->id, 'enrolled_at' => now()->subMinute()]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $completedCourse->id, 'enrolled_at' => now()]);
        Enrollment::query()->create(['user_id' => User::factory()->create()->id, 'course_id' => $otherCourse->id]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $startedCourse->modules->first()->lessons->first()->id, 'completed' => true]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $completedCourse->modules->first()->lessons->first()->id, 'completed' => true]);

        $this->actingAs($student)->get('/my-courses')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/MyCourses')
                ->has('courses', 2)
                ->where('courses.0.title', 'Curso concluído')
                ->where('courses.0.status', 'completed')
                ->where('courses.0.completedLessonCount', 1)
                ->where('courses.1.title', 'Curso em andamento')
                ->where('courses.1.status', 'in_progress')
                ->where('courses.1.completedLessonCount', 1)
                ->where('courses.1.lessonCount', 2)
            );
    }

    public function test_my_courses_returns_an_empty_library_for_a_student_without_enrollments(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get('/my-courses')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/MyCourses')
                ->has('courses', 0)
            );
    }

    public function test_available_programs_do_not_expose_unassigned_published_courses(): void
    {
        $student = User::factory()->create();
        $completedCourse = $this->course('Curso concluído', 'curso-concluido', 'Operação', 'Intermediário', 1);
        $inProgressCourse = $this->course('Curso em andamento', 'curso-em-andamento', 'Gestão', 'Iniciante', 2);
        $availableCourse = $this->course('Curso disponível', 'curso-disponivel', 'Operação', 'Intermediário', 1, 'courses/capa.jpg');
        $draftCourse = $this->course('Curso rascunho', 'curso-rascunho', 'Operação', 'Intermediário', 1, null, CourseStatus::Draft);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $completedCourse->id]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $inProgressCourse->id]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $completedCourse->modules->first()->lessons->first()->id, 'completed' => true]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $inProgressCourse->modules->first()->lessons->first()->id, 'completed' => true]);

        $this->actingAs($student)->get('/courses')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Index')
                ->has('offers', 0)
            );

        $this->assertModelExists($draftCourse);
    }

    private function course(string $title, string $slug, string $category, string $level, int $lessonCount, ?string $thumbnailPath = null, CourseStatus $status = CourseStatus::Published): Course
    {
        $course = Course::query()->create([
            'title' => $title,
            'slug' => $slug,
            'category' => $category,
            'level' => $level,
            'thumbnail_path' => $thumbnailPath,
            'status' => $status,
        ]);
        $module = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Módulo principal', 'position' => 1]);

        for ($position = 1; $position <= $lessonCount; $position++) {
            Lesson::query()->create([
                'module_id' => $module->id,
                'title' => "Aula {$position}",
                'video_provider' => VideoProvider::YouTube,
                'video_id' => 'dQw4w9WgXcQ',
                'position' => $position,
            ]);
        }

        return $course->load('modules.lessons');
    }
}
