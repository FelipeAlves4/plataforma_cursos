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

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_falls_back_to_the_first_incomplete_lesson(): void
    {
        $student = User::factory()->create();
        $course = Course::query()->create([
            'title' => 'Gestão de operações',
            'slug' => 'gestao-de-operacoes',
            'status' => CourseStatus::Published,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Fundamentos',
            'position' => 1,
        ]);
        $completedLesson = Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Aula concluída',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'aaaaaaaaaaa',
            'position' => 1,
        ]);
        $nextLesson = Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Próxima aula',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'bbbbbbbbbbb',
            'position' => 2,
        ]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $completedLesson->id, 'completed' => true]);

        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('continueLearning.lessonId', $nextLesson->id)
                ->where('continueLearning.lessonTitle', 'Próxima aula')
            );
    }

    public function test_administrators_are_redirected_to_the_administration_dashboard(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_dashboard_returns_no_content_rails_for_a_student_without_courses(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('courses', 0)
                ->where('continueLearning', null)
                ->has('featuredCourses', 0)
                ->has('newCourses', 0)
                ->has('recommendedCourses', 0)
            );
    }

    public function test_dashboard_provides_course_discovery_and_editorial_learning_data(): void
    {
        $student = User::factory()->create();
        $enrolledCourse = Course::query()->create([
            'title' => 'Gestão de salão',
            'slug' => 'gestao-de-salao',
            'status' => CourseStatus::Published,
            'category' => 'Gestão',
            'estimated_duration_minutes' => 90,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $enrolledCourse->id,
            'title' => 'Atendimento',
            'position' => 1,
        ]);
        $lesson = Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Recepção do cliente',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'dQw4w9WgXcQ',
            'duration_seconds' => 600,
            'position' => 1,
        ]);
        $recommendedCourse = Course::query()->create([
            'title' => 'Operação de cozinha',
            'slug' => 'operacao-de-cozinha',
            'status' => CourseStatus::Published,
        ]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $enrolledCourse->id]);

        $this->actingAs($student)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('courses.0.lessonCount', 1)
                ->where('courses.0.moduleCount', 1)
                ->missing('courses.0.videoId')
                ->where('continueLearning.lessonId', $lesson->id)
                ->where('featuredCourses.0.id', $enrolledCourse->id)
                ->where('newCourses.0.id', $recommendedCourse->id)
                ->where('recommendedCourses.0.id', $recommendedCourse->id)
                ->where('recommendedCourses.0.enrolled', false)
            );
    }
}
