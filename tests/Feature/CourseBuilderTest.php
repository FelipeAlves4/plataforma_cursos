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
use App\Services\MediaStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

class CourseBuilderTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creates_a_course_as_a_draft_with_an_automatic_slug(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)->post('/admin/courses', [
            'title' => 'Gestão de Restaurantes',
            'status' => CourseStatus::Published->value,
        ])->assertRedirect();

        $this->assertDatabaseHas('courses', [
            'title' => 'Gestão de Restaurantes',
            'slug' => 'gestao-de-restaurantes',
            'status' => CourseStatus::Draft->value,
            'thumbnail_path' => null,
        ]);
    }

    public function test_admin_uploads_a_course_cover_to_supabase_storage(): void
    {
        Storage::fake('supabase_course_covers');
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)->post('/admin/courses', [
            'title' => 'Gestão de Restaurantes',
            'thumbnail' => UploadedFile::fake()->image('cover.png'),
        ])->assertRedirect();

        $course = Course::query()->sole();
        $path = "courses/{$course->id}/cover.png";

        $this->assertSame($path, $course->thumbnail_path);
        Storage::disk('supabase_course_covers')->assertExists($path);
    }

    public function test_admin_replaces_a_course_cover_after_the_new_file_is_uploaded(): void
    {
        Storage::fake('supabase_course_covers');
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $oldPath = "courses/{$course->id}/cover.png";
        $course->update(['thumbnail_path' => $oldPath]);
        Storage::disk('supabase_course_covers')->put($oldPath, 'old cover');

        $this->actingAs($admin)->put("/admin/courses/{$course->id}", [
            ...$this->coursePayload($course, CourseStatus::Draft),
            'thumbnail' => UploadedFile::fake()->image('cover.webp'),
        ])->assertRedirect();

        $newPath = "courses/{$course->id}/cover.webp";

        $this->assertSame($newPath, $course->fresh()->thumbnail_path);
        Storage::disk('supabase_course_covers')->assertExists($newPath);
        Storage::disk('supabase_course_covers')->assertMissing($oldPath);
    }

    public function test_admin_keeps_the_existing_cover_when_its_replacement_upload_fails(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $course->update(['thumbnail_path' => "courses/{$course->id}/cover.png"]);
        $mediaStorage = $this->mock(MediaStorage::class);
        $mediaStorage->shouldReceive('replaceCourseCover')->once()->andThrow(new RuntimeException('Storage unavailable.'));

        $this->actingAs($admin)->from("/admin/courses/{$course->id}/edit")
            ->put("/admin/courses/{$course->id}", [
                ...$this->coursePayload($course, CourseStatus::Draft),
                'thumbnail' => UploadedFile::fake()->image('replacement.png'),
            ])
            ->assertRedirect("/admin/courses/{$course->id}/edit")
            ->assertSessionHasErrors('thumbnail');

        $this->assertSame("courses/{$course->id}/cover.png", $course->fresh()->thumbnail_path);
    }

    public function test_admin_removes_a_managed_supabase_cover_when_deleting_a_course(): void
    {
        Storage::fake('supabase_course_covers');
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $path = "courses/{$course->id}/cover.png";
        $course->update(['thumbnail_path' => $path]);
        Storage::disk('supabase_course_covers')->put($path, 'cover');

        $this->actingAs($admin)->delete("/admin/courses/{$course->id}")->assertRedirect();

        Storage::disk('supabase_course_covers')->assertMissing($path);
        $this->assertModelMissing($course);
    }

    public function test_admin_adds_modules_in_automatic_order(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();

        $this->actingAs($admin)->post("/admin/courses/{$course->id}/modules", ['title' => 'Introdução'])->assertRedirect();
        $this->actingAs($admin)->post("/admin/courses/{$course->id}/modules", ['title' => 'Gestão'])->assertRedirect();

        $this->assertDatabaseHas('modules', ['course_id' => $course->id, 'title' => 'Introdução', 'position' => 1]);
        $this->assertDatabaseHas('modules', ['course_id' => $course->id, 'title' => 'Gestão', 'position' => 2]);
    }

    public function test_admin_adds_a_normalized_youtube_lesson_in_automatic_order(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $module = $this->module();
        Lesson::query()->create([
            'module_id' => $module->id,
            'title' => 'Aula existente',
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'dQw4w9WgXcQ',
            'position' => 1,
        ]);

        $this->actingAs($admin)->post("/admin/modules/{$module->id}/lessons", [
            'title' => 'Como calcular o CMV',
            'description' => 'Uma explicação prática.',
            'video_url' => 'https://youtu.be/9bZkp7q19f0?t=12',
            'duration_seconds' => 720,
            'is_preview' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Como calcular o CMV',
            'video_provider' => VideoProvider::YouTube->value,
            'video_id' => '9bZkp7q19f0',
            'video_url' => 'https://www.youtube.com/watch?v=9bZkp7q19f0',
            'duration_seconds' => 720,
            'position' => 2,
            'is_preview' => false,
        ]);
    }

    public function test_admin_receives_a_friendly_error_for_an_invalid_youtube_url(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $module = $this->module();

        $this->actingAs($admin)->from("/admin/courses/{$module->course_id}/edit")
            ->post("/admin/modules/{$module->id}/lessons", [
                'title' => 'Aula inválida',
                'video_url' => 'https://example.com/video',
                'is_preview' => false,
            ])
            ->assertRedirect("/admin/courses/{$module->course_id}/edit")
            ->assertSessionHasErrors([
                'video_url' => 'Não conseguimos identificar esse vídeo do YouTube. Confira o link e tente novamente.',
            ]);

        $this->assertDatabaseCount('lessons', 0);
    }

    public function test_admin_edits_a_lesson_and_replaces_its_youtube_video(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $lesson = $this->lesson();

        $this->actingAs($admin)->put("/admin/lessons/{$lesson->id}", [
            'title' => 'Aula atualizada',
            'description' => 'Conteúdo revisado.',
            'video_url' => 'https://www.youtube.com/watch?v=9bZkp7q19f0',
            'duration_seconds' => 300,
            'is_preview' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Aula atualizada',
            'description' => 'Conteúdo revisado.',
            'video_id' => '9bZkp7q19f0',
            'duration_seconds' => 300,
            'is_preview' => true,
        ]);
    }

    public function test_admin_deletes_a_lesson(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $lesson = $this->lesson();

        $this->actingAs($admin)->delete("/admin/lessons/{$lesson->id}")->assertRedirect();

        $this->assertModelMissing($lesson);
    }

    public function test_admin_reorders_modules_and_lessons(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $firstModule = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Primeiro', 'position' => 1]);
        $secondModule = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Segundo', 'position' => 2]);
        $firstLesson = $this->lesson($firstModule, 'Primeira aula', 1);
        $secondLesson = $this->lesson($firstModule, 'Segunda aula', 2);

        $this->actingAs($admin)->put("/admin/courses/{$course->id}/modules/reorder", [
            'module_ids' => [$secondModule->id, $firstModule->id],
        ])->assertRedirect();
        $this->actingAs($admin)->put("/admin/modules/{$firstModule->id}/lessons/reorder", [
            'lesson_ids' => [$secondLesson->id, $firstLesson->id],
        ])->assertRedirect();

        $this->assertSame(1, $secondModule->fresh()->position);
        $this->assertSame(2, $firstModule->fresh()->position);
        $this->assertSame(1, $secondLesson->fresh()->position);
        $this->assertSame(2, $firstLesson->fresh()->position);
    }

    public function test_course_cannot_be_published_without_a_valid_lesson(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();

        $this->actingAs($admin)->from("/admin/courses/{$course->id}/edit")
            ->put("/admin/courses/{$course->id}", $this->coursePayload($course, CourseStatus::Published))
            ->assertRedirect("/admin/courses/{$course->id}/edit")
            ->assertSessionHasErrors([
                'status' => 'Adicione pelo menos uma aula antes de publicar o curso.',
            ]);

        $this->assertSame(CourseStatus::Draft, $course->fresh()->status);
    }

    public function test_admin_publishes_a_course_with_a_valid_lesson(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $this->lesson($this->module($course));

        $this->actingAs($admin)->put("/admin/courses/{$course->id}", $this->coursePayload($course, CourseStatus::Published))->assertRedirect();

        $this->assertSame(CourseStatus::Published, $course->fresh()->status);
    }

    public function test_student_cannot_manage_the_course_builder(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        $course = $this->course();

        $this->actingAs($student)->post("/admin/courses/{$course->id}/modules", ['title' => 'Não permitido'])->assertForbidden();
    }

    public function test_draft_course_is_not_available_to_an_enrolled_student(): void
    {
        $course = $this->course();
        $lesson = $this->lesson($this->module($course));
        $student = User::factory()->create(['role' => UserRole::Student]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->actingAs($student)->get('/courses')->assertInertia(fn (Assert $page) => $page->has('offers', 0));
        $this->actingAs($student)->get("/courses/{$course->slug}")->assertForbidden();
        $this->actingAs($student)->get("/lessons/{$lesson->id}")->assertForbidden();
    }

    public function test_enrolled_student_sees_the_published_course_structure(): void
    {
        $course = $this->course();
        $module = $this->module($course);
        $lesson = $this->lesson($module);
        $course->update(['status' => CourseStatus::Published]);
        $student = User::factory()->create(['role' => UserRole::Student]);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->actingAs($student)->get("/courses/{$course->slug}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Show')
                ->where('course.modules.0.title', $module->title)
                ->where('course.modules.0.lessons.0.id', $lesson->id)
            );
    }

    public function test_available_programs_do_not_expose_an_unassigned_published_course(): void
    {
        $course = $this->course();
        $this->lesson($this->module($course));
        $course->update(['status' => CourseStatus::Published]);
        $student = User::factory()->create(['role' => UserRole::Student]);

        $this->actingAs($student)->get('/courses')
            ->assertInertia(fn (Assert $page) => $page->has('offers', 0));
    }

    public function test_admin_can_preview_a_draft_course_without_creating_enrollment_or_progress(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course();
        $lesson = $this->lesson($this->module($course));

        $this->actingAs($admin)->get("/admin/courses/{$course->id}/preview")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Lessons/Show')
                ->where('lesson.id', $lesson->id)
                ->where('course.progress.completedLessons', 0)
                ->where('preview.returnUrl', route('admin.courses.edit', $course))
                ->where('preview.baseUrl', route('admin.courses.preview', $course))
            );

        $this->assertDatabaseCount('enrollments', 0);
        $this->assertDatabaseCount('lesson_progress', 0);
    }

    public function test_student_cannot_access_course_preview(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        $course = $this->course();

        $this->actingAs($student)->get("/admin/courses/{$course->id}/preview")->assertForbidden();
    }

    private function course(): Course
    {
        return Course::query()->create([
            'title' => 'Curso de gestão',
            'slug' => 'curso-de-gestao-'.Course::query()->count(),
            'status' => CourseStatus::Draft,
        ]);
    }

    private function module(?Course $course = null): CourseModule
    {
        $course ??= $this->course();

        return CourseModule::query()->create([
            'course_id' => $course->id,
            'title' => 'Fundamentos',
            'position' => 1,
        ]);
    }

    private function lesson(?CourseModule $module = null, string $title = 'Aula de teste', int $position = 1): Lesson
    {
        $module ??= $this->module();

        return Lesson::query()->create([
            'module_id' => $module->id,
            'title' => $title,
            'video_provider' => VideoProvider::YouTube,
            'video_id' => 'dQw4w9WgXcQ',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'position' => $position,
        ]);
    }

    /** @return array<string, string> */
    private function coursePayload(Course $course, CourseStatus $status): array
    {
        return [
            'title' => $course->title,
            'slug' => $course->slug,
            'status' => $status->value,
        ];
    }
}
