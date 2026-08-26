<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Enums\VideoProvider;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrators_see_platform_metrics_and_recent_activity(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = User::factory()->create(['role' => UserRole::Student]);
        $publishedCourse = Course::query()->create([
            'title' => 'Liderança estratégica',
            'slug' => 'lideranca-estrategica',
            'status' => CourseStatus::Published,
        ]);
        Course::query()->create([
            'title' => 'Comunicação executiva',
            'slug' => 'comunicacao-executiva',
            'status' => CourseStatus::Draft,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $publishedCourse->id,
            'title' => 'Fundamentos',
            'position' => 1,
        ]);
        Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Aula inicial',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'aaaaaaaaaaa',
            'position' => 1,
        ]);
        Enrollment::query()->create([
            'user_id' => $student->id,
            'course_id' => $publishedCourse->id,
            'enrolled_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('metrics.students', 1)
                ->where('metrics.courses', 2)
                ->where('metrics.publishedCourses', 1)
                ->where('metrics.draftCourses', 1)
                ->where('metrics.lessons', 1)
                ->where('metrics.enrollments', 1)
                ->has('recentCourses', 2)
                ->has('recentEnrollments', 1)
                ->where('recentEnrollments.0.student.name', $student->name)
                ->where('recentEnrollments.0.course.id', $publishedCourse->id)
            );
    }
}
