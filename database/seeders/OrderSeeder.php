<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Order;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $offer = Offer::query()->first();

        if ($offer === null) {
            return;
        }

        Order::query()->firstOrCreate(
            ['offer_id' => $offer->id, 'status' => 'PENDING'],
            [
                'user_id' => $offer->user_id,
                'order_nsu' => 'ASEX-'.Str::upper((string) Str::ulid()),
                'amount_cents' => $offer->price_cents,
            ],
        );
    }
}
