<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateAdminCommand extends Command
{
    protected $signature = 'asex:create-admin';

    protected $description = 'Cria o primeiro administrador sem armazenar credenciais no código';

    public function handle(): int
    {
        $credentials = [
            'name' => Str::squish((string) $this->ask('Nome completo')),
            'email' => Str::lower(trim((string) $this->ask('E-mail'))),
            'password' => (string) $this->secret('Senha'),
            'password_confirmation' => (string) $this->secret('Confirme a senha'),
        ];

        $validator = Validator::make($credentials, [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $admin = User::query()->create([
            'name' => $credentials['name'],
            'email' => $credentials['email'],
            'password' => Hash::make($credentials['password']),
            'role' => UserRole::Admin,
        ]);
        $admin->forceFill(['email_verified_at' => now()])->save();

        $this->info("Administrador {$admin->email} criado com sucesso.");

        return self::SUCCESS;
    }
}
