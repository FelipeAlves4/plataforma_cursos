<?php

namespace Tests\Feature\Console;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_creates_a_verified_admin_with_a_hashed_password(): void
    {
        $this->artisan('asex:create-admin')
            ->expectsQuestion('Nome completo', 'Maria Administradora')
            ->expectsQuestion('E-mail', 'MARIA@EXAMPLE.COM')
            ->expectsQuestion('Senha', 'SenhaForte!123')
            ->expectsQuestion('Confirme a senha', 'SenhaForte!123')
            ->assertSuccessful();

        $admin = User::query()->where('email', 'maria@example.com')->firstOrFail();

        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('SenhaForte!123', $admin->password));
    }

    public function test_command_rejects_an_invalid_email(): void
    {
        $this->artisan('asex:create-admin')
            ->expectsQuestion('Nome completo', 'Maria Administradora')
            ->expectsQuestion('E-mail', 'email-invalido')
            ->expectsQuestion('Senha', 'SenhaForte!123')
            ->expectsQuestion('Confirme a senha', 'SenhaForte!123')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_command_does_not_overwrite_an_existing_user(): void
    {
        $student = User::factory()->create([
            'email' => 'existente@example.com',
            'role' => UserRole::Student,
        ]);

        $this->artisan('asex:create-admin')
            ->expectsQuestion('Nome completo', 'Novo Administrador')
            ->expectsQuestion('E-mail', 'existente@example.com')
            ->expectsQuestion('Senha', 'SenhaForte!123')
            ->expectsQuestion('Confirme a senha', 'SenhaForte!123')
            ->assertFailed();

        $this->assertSame(UserRole::Student, $student->fresh()->role);
        $this->assertDatabaseCount('users', 1);
    }
}
