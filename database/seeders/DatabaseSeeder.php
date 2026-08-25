<?php

namespace Database\Seeders;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Enums\VideoProvider;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->create([
            'name' => 'Admin da Plataforma',
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $students = User::factory(3)->create();

        $courses = [
            [
                'title' => 'Laravel do Zero',
                'slug' => 'laravel-do-zero',
                'description' => 'Fundamentos práticos para criar aplicações Laravel.',
                'modules' => [
                    'Introdução ao Laravel' => ['Boas-vindas', 'Preparando o ambiente', 'Primeira rota'],
                    'Banco de Dados' => ['Migrations e models', 'Relacionamentos Eloquent'],
                ],
            ],
            [
                'title' => 'React para Produtos Digitais',
                'slug' => 'react-para-produtos-digitais',
                'description' => 'Componentes, estado e interfaces com foco em produto.',
                'modules' => [
                    'Base do React' => ['Componentes e props', 'Estado e eventos'],
                    'Interface de Produto' => ['Composição de layouts', 'Feedback e acessibilidade'],
                ],
            ],
        ];

        foreach ($courses as $courseData) {
            $course = Course::query()->create([
                'title' => $courseData['title'],
                'slug' => $courseData['slug'],
                'description' => $courseData['description'],
                'status' => CourseStatus::Published,
            ]);

            foreach ($courseData['modules'] as $moduleTitle => $lessonTitles) {
                $module = CourseModule::query()->create([
                    'course_id' => $course->id,
                    'title' => $moduleTitle,
                    'position' => $course->modules()->count() + 1,
                ]);

                foreach ($lessonTitles as $index => $lessonTitle) {
                    Lesson::query()->create([
                        'module_id' => $module->id,
                        'title' => $lessonTitle,
                        'description' => "Conteúdo introdutório da aula {$lessonTitle}.",
                        'video_provider' => VideoProvider::YouTube,
                        'video_id' => 'dQw4w9WgXcQ',
                        'duration_seconds' => 600,
                        'position' => $index + 1,
                        'is_preview' => $index === 0,
                    ]);
                }
            }

            foreach ($students as $student) {
                Enrollment::query()->create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'enrolled_at' => now(),
                ]);
            }
        }

        $admin->touch();
    }
}
