<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => null,
            'verification_code' => (string) Str::ulid(),
            'certificate_number' => sprintf('ASEX-%s-%s', now()->format('Y'), Str::upper(Str::random(8))),
            'recipient_name' => fake()->name(),
            'course_title' => fake()->sentence(3),
            'instructor_name' => fake()->name(),
            'workload_minutes' => fake()->numberBetween(30, 480),
            'completed_at' => now()->subDay(),
            'issued_at' => now(),
        ];
    }
}
