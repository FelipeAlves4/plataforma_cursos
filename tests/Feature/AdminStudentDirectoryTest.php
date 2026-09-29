<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
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

class AdminStudentDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_all_students_with_consolidated_progress(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = User::factory()->create([
            'role' => UserRole::Student,
            'name' => 'Aluno Teste',
            'email' => 'aluno@teste.com',
        ]);
        $course = $this->publishedCourse('Curso principal', 'curso-principal');
        Enrollment::query()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);
        $lesson = $course->modules->first()->lessons->first();
        LessonProgress::query()->create([
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'started_at' => now(),
            'last_accessed_at' => now(),
            'completed' => true,
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get('/admin/students')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Students/Directory')
                ->has('students', 1)
                ->where('students.0.id', $student->id)
                ->where('students.0.courseCount', 1)
                ->where('students.0.completedCourses', 1)
                ->where('students.0.averageProgress', 100)
                ->where('students.0.status', 'Ativo')
            );
    }

    public function test_admin_can_open_student_detail_and_see_available_courses(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = User::factory()->create(['role' => UserRole::Student]);
        $enrolledCourse = $this->publishedCourse('Curso matriculado', 'curso-matriculado');
        $availableCourse = $this->publishedCourse('Curso disponível', 'curso-disponivel');
        Enrollment::query()->create([
            'user_id' => $student->id,
            'course_id' => $enrolledCourse->id,
            'enrolled_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get("/admin/students/{$student->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Students/Show')
                ->where('student.id', $student->id)
                ->has('courses', 1)
                ->where('courses.0.id', $enrolledCourse->id)
                ->has('availableCourses', 1)
                ->where('availableCourses.0.id', $availableCourse->id)
            );
    }

    public function test_student_cannot_open_admin_student_directory(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->get('/admin/students')->assertForbidden();
    }

    private function publishedCourse(string $title, string $slug): Course
    {
        $course = Course::query()->create([
            'title' => $title,
            'slug' => $slug,
            'status' => CourseStatus::Published,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Módulo 1',
            'position' => 1,
        ]);
        Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Aula 1',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'dQw4w9WgXcQ',
            'position' => 1,
        ]);

        return $course->load('modules.lessons');
    }
}
