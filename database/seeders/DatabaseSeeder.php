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

        $student = User::query()->create([
            'name' => 'Aluno Demonstração', 'email' => 'aluno@example.test', 'password' => Hash::make('password'),
            'role' => UserRole::Student, 'email_verified_at' => now(),
        ]);
        $instructor = User::query()->create([
            'name' => 'Mariana Costa', 'email' => 'instrutor@example.test', 'password' => Hash::make('password'),
            'role' => UserRole::Instructor, 'email_verified_at' => now(),
        ]);

        $courses = [
            [
                'title' => 'Gestão de Restaurantes: Fundamentos',
                'slug' => 'gestao-de-restaurantes-fundamentos',
                'description' => 'Ferramentas práticas para organizar a operação e crescer com consistência.',
                'category' => 'Gestão', 'level' => 'Iniciante',
                'modules' => [
                    'Introdução' => ['Boas-vindas', 'Como aproveitar a trilha'],
                    'Gestão' => ['Rotina e indicadores', 'Custos e margem'],
                    'Atendimento' => ['Experiência do cliente'],
                    'Operação' => ['Padrões que escalam'],
                ],
            ],
            [
                'title' => 'Atendimento que Fideliza',
                'slug' => 'atendimento-que-fideliza',
                'description' => 'Ações simples para melhorar cada contato com o cliente.',
                'category' => 'Atendimento', 'level' => 'Intermediário',
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
                'category' => $courseData['category'], 'level' => $courseData['level'], 'instructor_id' => $instructor->id,
                'estimated_duration_minutes' => 90,
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

            Enrollment::query()->create(['user_id' => $student->id, 'course_id' => $course->id, 'enrolled_at' => now()]);
        }

        $admin->touch();
    }
}
