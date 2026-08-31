<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Offer;
use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CommerceTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_creates_a_program_with_unique_published_courses(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $firstCourse = $this->course('Gestão financeira', 'gestao-financeira');
        $secondCourse = $this->course('Atendimento', 'atendimento');

        $this->actingAs($admin)->post('/admin/programs', [
            'name' => 'Gestão para restaurantes',
            'audience' => 'Restaurantes',
            'default_price_cents' => 69700,
            'active' => true,
            'course_ids' => [$firstCourse->id, $secondCourse->id],
        ])->assertRedirect();

        $program = Program::query()->firstOrFail();
        $this->assertSame(['Atendimento', 'Gestão financeira'], $program->courses()->orderBy('title')->pluck('title')->all());
        $this->assertSame(69700, $program->default_price_cents);
    }

    public function test_program_rejects_a_duplicate_course(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $course = $this->course('Gestão financeira', 'gestao-financeira');

        $this->actingAs($admin)->from('/admin/programs/create')->post('/admin/programs', [
            'name' => 'Gestão para restaurantes',
            'default_price_cents' => 69700,
            'active' => true,
            'course_ids' => [$course->id, $course->id],
        ])->assertRedirect('/admin/programs/create')->assertSessionHasErrors('course_ids.0');

        $this->assertDatabaseMissing('programs', ['name' => 'Gestão para restaurantes']);
    }

    public function test_administrator_creates_an_offer_with_a_price_and_course_snapshot(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = User::factory()->create();
        $program = $this->programWithCourses();

        $this->actingAs($admin)->post('/admin/offers', [
            'user_id' => $student->id,
            'program_id' => $program->id,
            'price_cents' => 59700,
        ])->assertRedirect();

        $offer = Offer::query()->firstOrFail();
        $this->assertSame('Gestão para restaurantes', $offer->program_name_snapshot);
        $this->assertSame(59700, $offer->price_cents);
        $this->assertSame(2, $offer->courses()->count());
        $this->assertSame($admin->id, $offer->created_by);
    }

    public function test_student_only_sees_their_own_payable_offers_and_library_stays_enrollment_only(): void
    {
        $student = User::factory()->create();
        $otherStudent = User::factory()->create();
        $ownedProgram = $this->programWithCourses();
        $otherProgram = $this->programWithCourses('Psicologia', 'psicologia');
        $ownedOffer = $this->offerFor($student, $ownedProgram, 69700);
        $this->offerFor($otherStudent, $otherProgram, 99700);
        Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $ownedProgram->courses()->firstOrFail()->id]);

        $this->actingAs($student)->get('/courses')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/Index')
                ->has('offers', 1)
                ->where('offers.0.id', $ownedOffer->id)
                ->where('offers.0.priceCents', 69700)
            );
        $this->actingAs($student)->get('/my-courses')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Courses/MyCourses')
                ->has('courses', 1)
            );
    }

    public function test_student_cannot_start_checkout_for_another_students_offer(): void
    {
        $student = User::factory()->create();
        $offer = $this->offerFor(User::factory()->create(), $this->programWithCourses(), 69700);

        $this->actingAs($student)->post("/offers/{$offer->id}/checkout")->assertNotFound();

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_uses_the_offers_server_side_price_and_persists_the_provider_url(): void
    {
        config()->set('services.infinitepay', [
            'handle' => 'asex',
            'redirect_url' => 'https://asex.test/payments/infinitepay/return',
            'webhook_url' => 'https://asex.test/webhooks/infinitepay',
        ]);
        Http::preventStrayRequests();
        Http::fake(['https://api.checkout.infinitepay.io/links' => Http::response(['url' => 'https://checkout.infinitepay.com.br/asex?lenc=abc'])]);
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700);

        $this->actingAs($student)->post("/offers/{$offer->id}/checkout")
            ->assertRedirect('https://checkout.infinitepay.com.br/asex?lenc=abc');

        $order = Order::query()->firstOrFail();
        $this->assertSame(69700, $order->amount_cents);
        $this->assertSame('https://checkout.infinitepay.com.br/asex?lenc=abc', $order->checkout_url);
        Http::assertSent(fn (ClientRequest $request): bool => $request->url() === 'https://api.checkout.infinitepay.io/links'
            && $request['items'][0]['price'] === 69700
            && $request['order_nsu'] === $order->order_nsu);
    }

    public function test_expired_offer_does_not_create_a_checkout(): void
    {
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700, now()->subMinute());

        $this->actingAs($student)->post("/offers/{$offer->id}/checkout")->assertRedirect();

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseHas('offers', ['id' => $offer->id, 'status' => OfferStatus::Expired->value]);
    }

    public function test_checkout_provider_failure_marks_the_order_failed_without_creating_enrollments(): void
    {
        config()->set('services.infinitepay', [
            'handle' => 'asex',
            'redirect_url' => 'https://asex.test/payments/infinitepay/return',
            'webhook_url' => 'https://asex.test/webhooks/infinitepay',
        ]);
        Http::preventStrayRequests();
        Http::fake(['https://api.checkout.infinitepay.io/links' => Http::response([], 500)]);
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700);

        $this->actingAs($student)->from('/courses')->post("/offers/{$offer->id}/checkout")
            ->assertRedirect('/courses')
            ->assertSessionHasErrors('offer');

        $this->assertDatabaseHas('orders', ['offer_id' => $offer->id, 'status' => OrderStatus::Failed->value]);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_unverified_payment_check_never_fulfills_the_offer(): void
    {
        config()->set('services.infinitepay.handle', 'asex');
        Http::preventStrayRequests();
        Http::fake(['https://api.checkout.infinitepay.io/payment_check' => Http::response(['success' => true, 'paid' => false, 'amount' => 69700])]);
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700);
        $order = Order::query()->create(['offer_id' => $offer->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-UNVERIFIED-1', 'amount_cents' => 69700]);

        $this->postJson('/webhooks/infinitepay', ['invoice_slug' => 'invoice', 'amount' => 69700, 'transaction_nsu' => 'transaction', 'order_nsu' => $order->order_nsu])
            ->assertBadRequest();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => OrderStatus::Pending->value]);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_verified_webhook_marks_order_and_offer_paid_and_enrolls_only_snapshot_courses_once(): void
    {
        config()->set('services.infinitepay.handle', 'asex');
        Http::preventStrayRequests();
        Http::fake(['https://api.checkout.infinitepay.io/payment_check' => Http::response([
            'success' => true,
            'paid' => true,
            'amount' => 69700,
            'paid_amount' => 69700,
            'installments' => 1,
            'capture_method' => 'pix',
        ])]);
        $student = User::factory()->create();
        $program = $this->programWithCourses();
        $offer = $this->offerFor($student, $program, 69700);
        $outsideCourse = $this->course('Curso fora da oferta', 'fora-da-oferta');
        $order = Order::query()->create([
            'offer_id' => $offer->id,
            'user_id' => $student->id,
            'order_nsu' => 'ASEX-WEBHOOK-1',
            'amount_cents' => 69700,
        ]);
        $payload = [
            'invoice_slug' => 'invoice-1',
            'amount' => 69700,
            'paid_amount' => 69700,
            'installments' => 1,
            'capture_method' => 'pix',
            'transaction_nsu' => 'transaction-1',
            'order_nsu' => $order->order_nsu,
            'receipt_url' => 'https://receipt.test/1',
            'items' => [],
        ];

        $this->postJson('/webhooks/infinitepay', $payload)->assertOk();
        $this->postJson('/webhooks/infinitepay', $payload)->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => OrderStatus::Paid->value, 'provider_transaction_id' => 'transaction-1']);
        $this->assertDatabaseHas('offers', ['id' => $offer->id, 'status' => OfferStatus::Paid->value]);
        $this->assertSame(2, Enrollment::query()->where('user_id', $student->id)->count());
        $this->assertDatabaseMissing('enrollments', ['user_id' => $student->id, 'course_id' => $outsideCourse->id]);
    }

    public function test_unknown_or_mismatched_webhook_never_releases_courses(): void
    {
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700);
        $order = Order::query()->create(['offer_id' => $offer->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-MISMATCH-1', 'amount_cents' => 69700]);

        $this->postJson('/webhooks/infinitepay', ['invoice_slug' => 'invoice', 'amount' => 1, 'transaction_nsu' => 'transaction', 'order_nsu' => $order->order_nsu])->assertBadRequest();
        $this->postJson('/webhooks/infinitepay', ['invoice_slug' => 'invoice', 'amount' => 69700, 'transaction_nsu' => 'transaction', 'order_nsu' => 'UNKNOWN'])->assertBadRequest();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => OrderStatus::Pending->value]);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_payment_return_renders_pending_paid_and_failed_order_states_for_the_owner(): void
    {
        $student = User::factory()->create();
        $offer = $this->offerFor($student, $this->programWithCourses(), 69700);
        $pendingOrder = Order::query()->create(['offer_id' => $offer->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-RETURN-PENDING', 'amount_cents' => 69700]);
        $paidOrder = Order::query()->create(['offer_id' => $offer->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-RETURN-PAID', 'amount_cents' => 69700, 'status' => OrderStatus::Paid, 'paid_at' => now()]);
        $failedOrder = Order::query()->create(['offer_id' => $offer->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-RETURN-FAILED', 'amount_cents' => 69700, 'status' => OrderStatus::Failed, 'failed_at' => now()]);

        foreach ([$pendingOrder, $paidOrder, $failedOrder] as $order) {
            $this->actingAs($student)->get('/payments/infinitepay/return?order_nsu='.$order->order_nsu)
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Payments/InfinitePayReturn')
                    ->where('order.status', $order->status->value)
                );
        }
    }

    public function test_order_status_is_only_available_to_its_owner(): void
    {
        $student = User::factory()->create();
        $order = Order::query()->create(['offer_id' => $this->offerFor($student, $this->programWithCourses(), 69700)->id, 'user_id' => $student->id, 'order_nsu' => 'ASEX-STATUS-1', 'amount_cents' => 69700]);

        $this->actingAs($student)->get("/orders/{$order->id}/status")
            ->assertOk()
            ->assertJsonPath('status', OrderStatus::Pending->value);
        $this->actingAs(User::factory()->create())->get("/orders/{$order->id}/status")->assertNotFound();
    }

    public function test_only_administrators_can_manage_programs_and_sales(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get('/admin/programs')->assertForbidden();
        $this->actingAs($student)->get('/admin/sales')->assertForbidden();
    }

    private function course(string $title, string $slug): Course
    {
        return Course::query()->create(['title' => $title, 'slug' => $slug, 'status' => CourseStatus::Published]);
    }

    private function programWithCourses(string $name = 'Gestão para restaurantes', string $slug = 'restaurantes'): Program
    {
        $program = Program::query()->create(['name' => $name, 'default_price_cents' => 99700, 'active' => true]);
        $program->courses()->attach([
            $this->course("{$name} financeiro", "{$slug}-financeiro")->id,
            $this->course("{$name} liderança", "{$slug}-lideranca")->id,
        ]);

        return $program;
    }

    private function offerFor(User $student, Program $program, int $priceCents, ?\DateTimeInterface $expiresAt = null): Offer
    {
        $offer = Offer::query()->create([
            'user_id' => $student->id,
            'program_id' => $program->id,
            'created_by' => User::factory()->create(['role' => UserRole::Admin])->id,
            'program_name_snapshot' => $program->name,
            'price_cents' => $priceCents,
            'expires_at' => $expiresAt,
        ]);
        $offer->courses()->attach($program->courses()->pluck('courses.id'));

        return $offer;
    }
}
