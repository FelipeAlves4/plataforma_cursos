<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/profile')
            ->assertInertia(fn (Assert $page) => $page->component('Profile/Edit'));
    }

    public function test_administrator_profile_page_is_displayed_without_changing_admin_access(): void
    {
        $administrator = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($administrator)
            ->get('/profile')
            ->assertInertia(fn (Assert $page) => $page->component('Profile/Edit'));
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_professional_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '11999999999',
                'job_title' => 'Gerente',
                'company' => 'Restaurante Exemplo',
                'business_segment' => 'Restaurante',
                'city' => 'São Paulo',
                'state' => 'SP',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Gerente', $user->job_title);
        $this->assertSame('Restaurante Exemplo', $user->company);
        $this->assertSame('SP', $user->state);
    }

    public function test_profile_information_requires_valid_personal_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/profile')
            ->patch('/profile', [
                'name' => '',
                'email' => 'not-an-email',
                'state' => 'São Paulo',
            ])
            ->assertSessionHasErrors(['name', 'email', 'state'])
            ->assertRedirect('/profile');

        $this->assertSame($user->name, $user->fresh()->name);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_user_account_deletion_removes_a_managed_supabase_avatar(): void
    {
        Storage::fake('supabase_avatars');
        $user = User::factory()->create();
        $avatarPath = "users/{$user->id}/avatar.png";
        $user->update(['avatar_path' => $avatarPath]);
        Storage::disk('supabase_avatars')->put($user->avatar_path, 'avatar');

        $this->actingAs($user)
            ->delete('/profile', ['password' => 'password'])
            ->assertRedirect('/');

        Storage::disk('supabase_avatars')->assertMissing($avatarPath);
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
