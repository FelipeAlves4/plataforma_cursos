<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\VideoProvider;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_403_when_an_unenrolled_student_tries_to_issue_a_certificate(): void
    {
        $course = $this->courseWithLessons(1);
        $student = User::factory()->create();
        $this->completeAllLessons($student, $course);

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertForbidden();

        $this->assertDatabaseCount('certificates', 0);
    }

    public function test_returns_403_when_a_student_has_incomplete_course_progress(): void
    {
        $course = $this->courseWithLessons(2);
        $student = $this->enroll(User::factory()->create(), $course);
        $this->completeLesson($student, $course->lessons()->firstOrFail());

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertForbidden();

        $this->assertDatabaseCount('certificates', 0);
    }

    public function test_returns_403_when_a_course_has_no_lessons(): void
    {
        $course = Course::query()->create(['title' => 'Sem aulas', 'slug' => 'sem-aulas', 'status' => CourseStatus::Published]);
        $student = $this->enroll(User::factory()->create(), $course);

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertForbidden();

        $this->assertDatabaseCount('certificates', 0);
    }

    public function test_returns_403_when_certificates_are_disabled_for_the_course(): void
    {
        $course = $this->courseWithLessons(1, ['certificate_enabled' => false]);
        $student = $this->enroll(User::factory()->create(), $course);
        $this->completeAllLessons($student, $course);

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertForbidden();

        $this->assertDatabaseCount('certificates', 0);
    }

    public function test_issues_one_certificate_with_immutable_snapshots_for_an_eligible_student(): void
    {
        $instructor = User::factory()->create(['name' => 'Marina Instrutora']);
        $course = $this->courseWithLessons(2, [
            'title' => 'Gestão de Restaurantes',
            'instructor_id' => $instructor->id,
            'estimated_duration_minutes' => 90,
        ]);
        $student = $this->enroll(User::factory()->create(['name' => 'Ana Aluna']), $course);
        $this->completeAllLessons($student, $course);

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertRedirect('/certificates');
        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertRedirect('/certificates');

        $certificate = Certificate::query()->sole();
        $this->assertSame('Ana Aluna', $certificate->recipient_name);
        $this->assertSame('Gestão de Restaurantes', $certificate->course_title);
        $this->assertSame('Marina Instrutora', $certificate->instructor_name);
        $this->assertSame(90, $certificate->workload_minutes);
        $this->assertMatchesRegularExpression('/^ASEX-\d{4}-[A-Z0-9]{8}$/', $certificate->certificate_number);
        $this->assertNotSame((string) $certificate->id, $certificate->verification_code);

        $course->update(['title' => 'Título alterado', 'estimated_duration_minutes' => 240]);
        $instructor->update(['name' => 'Outro nome']);

        $certificate->refresh();
        $this->assertSame('Gestão de Restaurantes', $certificate->course_title);
        $this->assertSame('Marina Instrutora', $certificate->instructor_name);
        $this->assertSame(90, $certificate->workload_minutes);
    }

    public function test_automatically_issues_a_certificate_when_the_final_lesson_is_completed(): void
    {
        $course = $this->courseWithLessons(1);
        $student = $this->enroll(User::factory()->create(), $course);
        $lesson = $course->lessons()->firstOrFail();

        $this->actingAs($student)->put("/lessons/{$lesson->id}/progress", ['completed' => true])->assertRedirect();

        $this->assertDatabaseHas('certificates', ['user_id' => $student->id, 'course_id' => $course->id]);
    }

    public function test_allows_a_historically_completed_course_to_be_issued_from_the_certificates_page(): void
    {
        $course = $this->courseWithLessons(1);
        $student = $this->enroll(User::factory()->create(), $course);
        $this->completeAllLessons($student, $course);

        $this->actingAs($student)->get('/certificates')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Certificates/Index')
                ->has('certificates', 0)
                ->where('availableCourses.0.id', $course->id)
            );
    }

    public function test_owner_can_download_a_pdf_certificate(): void
    {
        [$student, $certificate] = $this->issuedCertificate();

        $response = $this->actingAs($student)
            ->get("/certificates/{$certificate->id}/download")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringContainsString(
            "certificado-{$certificate->certificate_number}.pdf",
            $response->headers->get('content-disposition', ''),
        );
    }

    public function test_returns_403_when_another_student_downloads_a_certificate(): void
    {
        [, $certificate] = $this->issuedCertificate();
        $otherStudent = User::factory()->create();

        $this->actingAs($otherStudent)->get("/certificates/{$certificate->id}/download")->assertForbidden();
    }

    public function test_renders_a_valid_public_verification_page(): void
    {
        [, $certificate] = $this->issuedCertificate();

        $this->get("/certificates/verify/{$certificate->verification_code}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Certificates/Verify')
                ->where('certificate.number', $certificate->certificate_number)
                ->where('certificate.recipientName', $certificate->recipient_name)
            );
    }

    public function test_renders_a_generic_page_when_a_public_verification_code_is_invalid(): void
    {
        $this->get('/certificates/verify/not-a-real-code')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Certificates/Verify')
                ->where('certificate', null)
            );
    }

    public function test_keeps_certificate_snapshots_when_the_course_is_deleted(): void
    {
        [, $certificate] = $this->issuedCertificate();
        $course = $certificate->course;

        $course->delete();

        $certificate->refresh();
        $this->assertNull($certificate->course_id);
        $this->assertSame('Curso de gestão', $certificate->course_title);
    }

    public function test_admin_preview_does_not_issue_a_certificate(): void
    {
        $course = $this->courseWithLessons(1);
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $this->actingAs($admin)->get("/admin/courses/{$course->id}/preview")->assertOk();

        $this->assertDatabaseCount('certificates', 0);
    }

    /** @return array{User, Certificate} */
    private function issuedCertificate(): array
    {
        $course = $this->courseWithLessons(1);
        $student = $this->enroll(User::factory()->create(['name' => 'Estudante Certificado']), $course);
        $this->completeAllLessons($student, $course);

        $this->actingAs($student)->post("/courses/{$course->id}/certificate")->assertRedirect('/certificates');

        return [$student, Certificate::query()->sole()];
    }

    private function courseWithLessons(int $lessonCount, array $attributes = []): Course
    {
        $course = Course::query()->create([
            'title' => 'Curso de gestão',
            'slug' => 'curso-de-gestao-'.Course::query()->count(),
            'status' => CourseStatus::Published,
            ...$attributes,
        ]);
        $module = CourseModule::query()->create(['course_id' => $course->id, 'title' => 'Fundamentos', 'position' => 1]);

        foreach (range(1, $lessonCount) as $position) {
            Lesson::query()->create([
                'module_id' => $module->id,
                'title' => "Aula {$position}",
                'video_provider' => VideoProvider::YouTube,
                'video_id' => "video-{$position}",
                'position' => $position,
            ]);
        }

        return $course;
    }

    private function enroll(User $student, Course $course): User
    {
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        return $student;
    }

    private function completeAllLessons(User $student, Course $course): void
    {
        $course->lessons()->each(fn (Lesson $lesson) => $this->completeLesson($student, $lesson));
    }

    private function completeLesson(User $student, Lesson $lesson): void
    {
        LessonProgress::query()->create([
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'started_at' => now()->subHour(),
            'completed_at' => now(),
        ]);
    }
}
