<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertSame(UserRole::Student, User::query()->where('email', 'test@example.com')->firstOrFail()->role);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_is_rate_limited_after_six_attempts(): void
    {
        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
                ->post('/register', []);
        }

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
            ->post('/register', [])
            ->assertTooManyRequests();
    }
}
