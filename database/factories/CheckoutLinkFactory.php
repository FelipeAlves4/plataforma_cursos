<?php

namespace Database\Factories;

use App\Models\CheckoutLink;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CheckoutLink>
 */
class CheckoutLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'slug' => fake()->unique()->slug(),
            'token' => fake()->unique()->regexify('[A-Za-z0-9]{64}'),
            'price_cents' => fake()->numberBetween(200, 200000),
            'active' => true,
            'created_by' => User::factory(),
        ];
    }
}
