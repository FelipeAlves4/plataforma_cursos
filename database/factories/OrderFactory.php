<?php

namespace Database\Factories;

use App\Enums\OrderProvider;
use App\Enums\OrderStatus;
use App\Models\Offer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'offer_id' => Offer::factory(),
            'user_id' => User::factory(),
            'provider' => OrderProvider::InfinitePay,
            'order_nsu' => 'ASEX-'.Str::upper((string) Str::ulid()),
            'amount_cents' => fake()->numberBetween(10000, 200000),
            'currency' => 'BRL',
            'status' => OrderStatus::Pending,
        ];
    }
}
