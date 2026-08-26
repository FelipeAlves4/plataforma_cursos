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
use App\Services\CourseProgressService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LessonExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_enrolled_student_receives_ordered_lesson_navigation_and_progress(): void
    {
        [$course, $firstLesson, $currentLesson, $lastLesson] = $this->courseWithOrderedLessons();
        $student = User::factory()->create();
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $firstLesson->id, 'completed' => true]);

        $this->actingAs($student)->get("/lessons/{$currentLesson->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Lessons/Show')
                ->where('lesson.id', $currentLesson->id)
                ->where('lesson.number', 2)
                ->where('course.progress.completedLessons', 1)
                ->where('course.progress.totalLessons', 3)
                ->where('course.progress.percentage', 33)
                ->where('course.modules.0.title', 'Fundamentos')
                ->where('course.modules.0.lessons.0.number', 1)
                ->where('course.modules.0.lessons.1.number', 2)
                ->where('navigation.previousLessonId', $firstLesson->id)
                ->where('navigation.nextLessonId', $lastLesson->id)
            );
    }

    public function test_last_lesson_returns_no_next_lesson(): void
    {
        [, , , $lastLesson] = $this->courseWithOrderedLessons();
        $student = User::factory()->create();
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $lastLesson->module->course_id]);

        $this->actingAs($student)->get("/lessons/{$lastLesson->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('lesson.number', 3)
                ->where('navigation.nextLessonId', null)
            );
    }

    public function test_marking_the_last_lesson_complete_returns_feedback_and_updates_progress(): void
    {
        [$course, $firstLesson, $currentLesson, $lastLesson] = $this->courseWithOrderedLessons();
        $student = User::factory()->create();
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $firstLesson->id, 'completed' => true]);
        LessonProgress::query()->create(['user_id' => $student->id, 'lesson_id' => $currentLesson->id, 'completed' => true]);

        $this->actingAs($student)->put("/lessons/{$lastLesson->id}/progress", ['completed' => true])
            ->assertRedirect()
            ->assertSessionHas('success', 'Aula marcada como concluída.');

        $this->assertDatabaseHas('lesson_progress', [
            'user_id' => $student->id,
            'lesson_id' => $lastLesson->id,
            'completed' => true,
        ]);
        $this->assertSame(100, app(CourseProgressService::class)->percentageFor($student, $course));
    }

    public function test_enrolled_student_can_view_a_published_course_without_lessons(): void
    {
        $course = Course::query()->create([
            'title' => 'Curso em preparação',
            'slug' => 'curso-em-preparacao',
            'status' => CourseStatus::Published,
        ]);
        $student = User::factory()->create();
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->actingAs($student)->get("/courses/{$course->slug}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Show')
                ->has('course.modules', 0)
                ->where('course.nextLessonId', null)
            );
    }

    /** @return array{Course, Lesson, Lesson, Lesson} */
    private function courseWithOrderedLessons(): array
    {
        $course = Course::query()->create([
            'title' => 'Gestão para Restaurantes',
            'slug' => 'gestao-para-restaurantes',
            'status' => CourseStatus::Published,
        ]);
        $secondModule = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Operação',
            'position' => 2,
        ]);
        $firstModule = CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Fundamentos',
            'position' => 1,
        ]);
        $firstLesson = $this->lesson($firstModule, 'Introdução', 1);
        $currentLesson = $this->lesson($firstModule, 'Como calcular o CMV', 2);
        $lastLesson = $this->lesson($secondModule, 'Ficha técnica', 1);

        return [$course, $firstLesson, $currentLesson, $lastLesson];
    }

    private function lesson(CourseModule $module, string $title, int $position): Lesson
    {
        return Lesson::query()->create([
            'module_id' => $module->id,
            'title' => $title,
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'dQw4w9WgXcQ',
            'position' => $position,
        ]);
    }
}
