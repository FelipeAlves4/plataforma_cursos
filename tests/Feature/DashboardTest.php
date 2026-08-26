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
}
