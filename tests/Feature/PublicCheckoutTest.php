<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\CheckoutLead;
use App\Models\CheckoutLink;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use App\Notifications\CheckoutAccessReady;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_open_an_active_checkout_link_without_an_account(): void
    {
        $link = $this->checkoutLink();

        $this->get("/checkout/{$link->token}")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Checkout/Show')
                ->where('checkout.priceCents', $link->price_cents)
                ->has('checkout.program.courses', 2)
            );
    }

    public function test_public_checkout_uses_the_server_price_persists_the_lead_and_returns_inertia_location(): void
    {
        $this->fakeCheckout('https://checkout.infinitepay.com.br/asex?lenc=public');
        $link = $this->checkoutLink(['price_cents' => 69700]);

        $response = $this->withHeader('X-Inertia', 'true')->post("/checkout/{$link->token}", [
            ...$this->buyerData('ANA@EXAMPLE.TEST'),
            'price_cents' => 1,
        ]);

        $response->assertStatus(409)
            ->assertHeader('X-Inertia-Location', 'https://checkout.infinitepay.com.br/asex?lenc=public');

        $order = Order::query()->firstOrFail();
        $this->assertNull($order->user_id);
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(69700, $order->amount_cents);
        $this->assertSame('https://checkout.infinitepay.com.br/asex?lenc=public', $order->checkout_url);
        $this->assertSame(2, $order->courses()->count());
        $this->assertDatabaseHas('checkout_leads', ['email_normalized' => 'ana@example.test', 'name' => 'Ana da Silva']);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('enrollments', 0);
        Http::assertSent(fn (ClientRequest $request): bool => $request->url() === 'https://api.checkout.infinitepay.io/links'
            && $request['items'][0]['price'] === 69700
            && $request['customer']['name'] === 'Ana da Silva'
            && $request['customer']['email'] === 'ANA@EXAMPLE.TEST'
            && $request['customer']['phone_number'] === '11999999999');
    }

    public function test_public_checkout_reuses_the_pending_order_url_without_calling_infinitepay_again(): void
    {
        Http::preventStrayRequests();
        $link = $this->checkoutLink();
        $lead = CheckoutLead::query()->create([
            'checkout_link_id' => $link->id,
            'name' => 'Ana da Silva',
            'email' => 'ana@example.test',
            'email_normalized' => 'ana@example.test',
            'phone' => '11999999999',
        ]);
        $order = Order::query()->create([
            'checkout_link_id' => $link->id,
            'checkout_lead_id' => $lead->id,
            'program_id' => $link->program_id,
            'program_name_snapshot' => $link->program->name,
            'order_nsu' => 'ASEX-PUBLIC-REUSED',
            'amount_cents' => $link->price_cents,
            'checkout_url' => 'https://checkout.infinitepay.com.br/asex?lenc=reused',
        ]);
        $order->courses()->sync($link->program->courses()->pluck('courses.id'));

        $this->withHeader('X-Inertia', 'true')->post("/checkout/{$link->token}", $this->buyerData())
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', $order->checkout_url);

        $this->assertDatabaseCount('orders', 1);
        Http::assertNothingSent();
    }

    public function test_inactive_or_expired_links_are_not_available_for_checkout(): void
    {
        $inactive = $this->checkoutLink(['active' => false]);
        $expired = $this->checkoutLink(['expires_at' => now()->subMinute()]);

        $this->get("/checkout/{$inactive->token}")->assertNotFound();
        $this->post("/checkout/{$expired->token}", $this->buyerData())->assertNotFound();

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_administrator_can_create_and_deactivate_a_checkout_link(): void
    {
        $sourceLink = $this->checkoutLink();
        $admin = User::query()->findOrFail($sourceLink->created_by);

        $this->actingAs($admin)->post('/admin/checkout-links', [
            'program_id' => $sourceLink->program_id,
            'price_cents' => 49700,
        ])->assertRedirect();

        $checkoutLink = CheckoutLink::query()->latest('id')->firstOrFail();
        $this->assertSame(49700, $checkoutLink->price_cents);
        $this->assertSame(64, strlen($checkoutLink->token));
        $this->actingAs($admin)->patch("/admin/checkout-links/{$checkoutLink->id}", ['active' => false])->assertRedirect();
        $this->assertFalse($checkoutLink->fresh()->active);
    }

    public function test_public_checkout_error_is_returned_to_the_buyer(): void
    {
        $this->fakeCheckoutFailure();
        $link = $this->checkoutLink();

        $this->from("/checkout/{$link->token}")->post("/checkout/{$link->token}", $this->buyerData())
            ->assertRedirect("/checkout/{$link->token}")
            ->assertSessionHasErrors('checkout');

        $this->assertDatabaseHas('orders', ['status' => OrderStatus::Failed->value]);
        $this->assertDatabaseCount('enrollments', 0);
    }

    public function test_verified_webhook_creates_a_new_student_enrolls_the_snapshot_once_and_sends_activation(): void
    {
        Notification::fake();
        $this->fakePaidPaymentCheck();
        $link = $this->checkoutLink();
        $order = $this->publicOrder($link, 'new.student@example.test');
        $outsideCourse = Course::query()->create(['title' => 'Fora do programa', 'slug' => 'fora-do-programa', 'status' => CourseStatus::Published]);
        $link->program->courses()->sync([$link->program->courses()->firstOrFail()->id, $outsideCourse->id]);
        $payload = $this->webhookPayload($order);

        $this->postJson('/webhooks/infinitepay', $payload)->assertOk();
        $this->postJson('/webhooks/infinitepay', $payload)->assertOk();

        $order->refresh();
        $student = User::query()->where('email', 'new.student@example.test')->firstOrFail();
        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertSame($student->id, $order->user_id);
        $this->assertNotNull($order->activation_expires_at);
        $this->assertSame(2, Enrollment::query()->where('user_id', $student->id)->count());
        $this->assertDatabaseMissing('enrollments', ['user_id' => $student->id, 'course_id' => $outsideCourse->id]);
        Notification::assertSentTo($student, CheckoutAccessReady::class);
        $this->assertCount(1, Notification::sent($student, CheckoutAccessReady::class));
    }

    public function test_verified_webhook_reuses_an_existing_user_by_normalized_email_without_sending_activation(): void
    {
        Notification::fake();
        $this->fakePaidPaymentCheck();
        $existingStudent = User::factory()->create(['email' => 'existing@example.test']);
        $order = $this->publicOrder($this->checkoutLink(), 'EXISTING@example.test');

        $this->postJson('/webhooks/infinitepay', $this->webhookPayload($order))->assertOk();

        $order->refresh();
        $this->assertSame($existingStudent->id, $order->user_id);
        $this->assertNull($order->activation_expires_at);
        $this->assertSame(1, User::query()->whereRaw('LOWER(email) = ?', ['existing@example.test'])->count());
        $this->assertSame(2, Enrollment::query()->where('user_id', $existingStudent->id)->count());
        Notification::assertNothingSent();
    }

    public function test_payment_return_does_not_release_a_public_order_without_verified_provider_data(): void
    {
        Http::preventStrayRequests();
        $order = $this->publicOrder($this->checkoutLink(), 'pending@example.test');

        $this->get('/payments/infinitepay/return?order_nsu='.$order->order_nsu)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Payments/PublicCheckoutReturn')
                ->where('order.status', 'PENDING')
            );

        $this->assertNull($order->fresh()->user_id);
        $this->assertDatabaseCount('enrollments', 0);
        Http::assertNothingSent();
    }

    public function test_new_student_can_use_the_temporary_activation_link_once_to_set_a_password(): void
    {
        Notification::fake();
        $this->fakePaidPaymentCheck();
        $order = $this->publicOrder($this->checkoutLink(), 'activate@example.test');
        $this->postJson('/webhooks/infinitepay', $this->webhookPayload($order))->assertOk();
        $order->refresh();
        $activationUrl = URL::temporarySignedRoute('checkout.access.create', $order->activation_expires_at, ['order' => $order]);

        $this->get($activationUrl)
            ->assertInertia(fn (Assert $page) => $page->component('Checkout/SetPassword'));
        $this->post($activationUrl, ['password' => 'StrongPassword!123', 'password_confirmation' => 'StrongPassword!123'])
            ->assertRedirect('/my-courses');

        $this->assertAuthenticatedAs($order->user);
        $this->assertNotNull($order->fresh()->activation_used_at);
        $this->post($activationUrl, ['password' => 'AnotherStrong!123', 'password_confirmation' => 'AnotherStrong!123'])->assertNotFound();
    }

    private function checkoutLink(array $attributes = []): CheckoutLink
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $program = Program::query()->create(['name' => 'ASEX Gestão', 'description' => 'Programa completo', 'default_price_cents' => 69700, 'active' => true]);
        $program->courses()->attach([
            Course::query()->create(['title' => 'Fundamentos', 'slug' => 'fundamentos-'.str()->random(8), 'status' => CourseStatus::Published])->id,
            Course::query()->create(['title' => 'Operação', 'slug' => 'operacao-'.str()->random(8), 'status' => CourseStatus::Published])->id,
        ]);

        return CheckoutLink::query()->create([
            'program_id' => $program->id,
            'slug' => 'asex-'.str()->random(8),
            'token' => str()->random(64),
            'price_cents' => 69700,
            'created_by' => $admin->id,
            ...$attributes,
        ])->load('program');
    }

    /** @return array{name: string, email: string, phone: string} */
    private function buyerData(string $email = 'ana@example.test'): array
    {
        return ['name' => 'Ana da Silva', 'email' => $email, 'phone' => '11999999999'];
    }

    private function publicOrder(CheckoutLink $link, string $email): Order
    {
        $lead = CheckoutLead::query()->create([
            'checkout_link_id' => $link->id,
            'name' => 'Ana da Silva',
            'email' => $email,
            'email_normalized' => mb_strtolower($email),
            'phone' => '11999999999',
        ]);
        $order = Order::query()->create([
            'checkout_link_id' => $link->id,
            'checkout_lead_id' => $lead->id,
            'program_id' => $link->program_id,
            'program_name_snapshot' => $link->program->name,
            'order_nsu' => 'ASEX-'.str()->upper(str()->random(16)),
            'amount_cents' => $link->price_cents,
        ]);
        $order->courses()->sync($link->program->courses()->pluck('courses.id'));

        return $order;
    }

    /** @return array{invoice_slug: string, amount: int, transaction_nsu: string, order_nsu: string} */
    private function webhookPayload(Order $order): array
    {
        return [
            'invoice_slug' => 'invoice-'.$order->id,
            'amount' => $order->amount_cents,
            'transaction_nsu' => 'transaction-'.$order->id,
            'order_nsu' => $order->order_nsu,
        ];
    }

    private function fakeCheckout(string $checkoutUrl): void
    {
        config()->set('services.infinitepay', [
            'handle' => 'asex',
            'redirect_url' => 'https://asex.test/payments/infinitepay/return',
            'webhook_url' => 'https://asex.test/webhooks/infinitepay',
        ]);
        Http::preventStrayRequests();
        Http::fake(['https://api.checkout.infinitepay.io/links' => Http::response(['url' => $checkoutUrl])]);
    }

    private function fakeCheckoutFailure(): void
    {
        $this->fakeCheckout('');
        Http::fake(['https://api.checkout.infinitepay.io/links' => Http::response([], 500)]);
    }

    private function fakePaidPaymentCheck(): void
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
    }
}
