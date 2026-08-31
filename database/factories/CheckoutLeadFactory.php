<?php

namespace Database\Factories;

use App\Models\CheckoutLead;
use App\Models\CheckoutLink;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CheckoutLead>
 */
class CheckoutLeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'checkout_link_id' => CheckoutLink::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_normalized' => fn (array $attributes): string => mb_strtolower($attributes['email']),
            'phone' => '11999999999',
        ];
    }
}
