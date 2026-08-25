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
use App\Services\CourseProgressService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_access_admin_area(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->get('/admin/courses')->assertForbidden();
    }

    public function test_admin_can_access_admin_area(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)->get('/admin/courses')->assertOk();
    }

    public function test_student_cannot_access_a_lesson_without_enrollment(): void
    {
        [$course, $lesson] = $this->courseWithLesson();
        $student = User::factory()->create();

        $this->actingAs($student)->get("/lessons/{$lesson->id}")->assertForbidden();

        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->actingAs($student)->get("/lessons/{$lesson->id}")->assertOk();
    }

    public function test_student_can_mark_a_lesson_complete_and_progress_is_calculated(): void
    {
        [$course, $firstLesson] = $this->courseWithLesson();
        $secondLesson = Lesson::query()->create([
            'module_id' => $firstLesson->module_id,
            'title' => 'Segunda aula',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'video-2',
            'position' => 2,
        ]);
        $student = User::factory()->create();
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->actingAs($student)
            ->put("/lessons/{$firstLesson->id}/progress", ['completed' => true, 'last_position_seconds' => 120])
            ->assertRedirect();

        $this->assertDatabaseHas('lesson_progress', [
            'user_id' => $student->id,
            'lesson_id' => $firstLesson->id,
            'completed' => true,
            'last_position_seconds' => 120,
        ]);
        $this->assertSame(50, app(CourseProgressService::class)->percentageFor($student, $course));

        LessonProgress::query()->where('lesson_id', $firstLesson->id)->update(['completed' => false]);
        $this->assertSame(0, app(CourseProgressService::class)->percentageFor($student, $course));
        $this->assertNotNull($secondLesson);
    }

    /** @return array{Course, Lesson} */
    private function courseWithLesson(): array
    {
        $course = Course::query()->create([
            'title' => 'Curso de teste',
            'slug' => 'curso-de-teste',
            'status' => CourseStatus::Published,
        ]);
        $module = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Módulo de teste',
            'position' => 1,
        ]);
        $lesson = Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Aula de teste',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'video-1',
            'position' => 1,
        ]);

        return [$course, $lesson];
    }
}
