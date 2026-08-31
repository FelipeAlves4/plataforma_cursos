<?php

namespace Database\Factories;

use App\Enums\OfferStatus;
use App\Models\Offer;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
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
            'program_id' => Program::factory(),
            'created_by' => User::factory(),
            'program_name_snapshot' => fake()->words(3, true),
            'price_cents' => fake()->numberBetween(10000, 200000),
            'status' => OfferStatus::Pending,
        ];
    }
}
