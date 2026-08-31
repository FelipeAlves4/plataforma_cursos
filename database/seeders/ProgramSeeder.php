<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $course = Course::query()->published()->first();

        if ($course === null) {
            return;
        }

        $program = Program::query()->firstOrCreate(
            ['name' => 'Programa demonstração'],
            ['default_price_cents' => 69700, 'active' => true],
        );
        $program->courses()->syncWithoutDetaching([$course->id]);
    }
}
