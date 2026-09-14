<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Enums\VideoProvider;
use App\Models\CheckoutLink;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Offer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrators_see_aggregated_metrics_from_real_student_progress_and_paid_sales(): void
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
        $lesson = Lesson::query()->create([
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
        LessonProgress::query()->create([
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'started_at' => now(),
            'last_accessed_at' => now(),
            'completed' => true,
            'completed_at' => now(),
        ]);
        $checkoutLink = CheckoutLink::factory()->create(['created_by' => $admin]);
        $offer = Offer::factory()->for($student)->for($admin, 'creator')->create();
        Order::factory()->for($student)->for($offer)->create([
            'checkout_link_id' => $checkoutLink->id,
            'status' => OrderStatus::Paid,
            'amount_cents' => 49700,
            'paid_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('dashboard.period', '30d')
                ->where('dashboard.summary.students.total', 1)
                ->where('dashboard.summary.students.new', 1)
                ->where('dashboard.summary.activeStudents.total', 1)
                ->where('dashboard.summary.revenue.amountCents', 49700)
                ->where('dashboard.summary.revenue.sales', 1)
                ->where('dashboard.summary.completionRate.percentage', 100)
                ->has('dashboard.studentsGrowth', 30)
                ->has('dashboard.revenueGrowth', 30)
                ->has('dashboard.coursePerformance', 2)
                ->where('dashboard.coursePerformance.0.id', $publishedCourse->id)
                ->where('dashboard.coursePerformance.0.completionRate', 100)
                ->where('dashboard.coursePerformance.0.averageProgress', 100)
                ->where('dashboard.engagement.active', 1)
                ->has('dashboard.recentActivity')
            );
    }

    public function test_dashboard_revenue_excludes_orders_that_are_not_paid_checkout_sales(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = User::factory()->create(['role' => UserRole::Student]);
        Order::factory()->for($student)->create([
            'status' => OrderStatus::Paid,
            'amount_cents' => 90000,
            'paid_at' => now(),
        ]);
        Order::factory()->for($student)->create([
            'checkout_link_id' => CheckoutLink::factory()->create(['created_by' => $admin])->id,
            'status' => OrderStatus::Failed,
            'amount_cents' => 90000,
            'paid_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertInertia(fn (Assert $page) => $page
                ->where('dashboard.summary.revenue.amountCents', 0)
                ->where('dashboard.summary.revenue.sales', 0)
            );
    }

    public function test_students_are_forbidden_from_viewing_the_administrative_dashboard(): void
    {
        $this->actingAs(User::factory()->create(['role' => UserRole::Student]))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_administrators_see_safe_empty_states_when_the_platform_has_no_student_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin)
            ->get('/admin?period=all')
            ->assertInertia(fn (Assert $page) => $page
                ->where('dashboard.period', 'all')
                ->where('dashboard.summary.students.total', 0)
                ->where('dashboard.summary.revenue.amountCents', 0)
                ->has('dashboard.coursePerformance', 0)
                ->has('dashboard.atRiskStudents', 0)
                ->has('dashboard.dropoffPoints', 0)
            );
    }
}
