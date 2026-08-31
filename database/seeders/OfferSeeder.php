<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Offer;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::query()->where('role', UserRole::Student)->first();
        $admin = User::query()->where('role', UserRole::Admin)->first();
        $program = Program::query()->with('courses:id')->active()->first();

        if ($student === null || $admin === null || $program === null || $program->courses->isEmpty()) {
            return;
        }

        $offer = Offer::query()->firstOrCreate(
            ['user_id' => $student->id, 'program_id' => $program->id, 'program_name_snapshot' => $program->name],
            ['created_by' => $admin->id, 'price_cents' => $program->default_price_cents],
        );
        $offer->courses()->syncWithoutDetaching($program->courses->pluck('id'));
    }
}
