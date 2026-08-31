<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProgramRequest;
use App\Http\Requests\Admin\UpdateProgramRequest;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Programs/Index', [
            'programs' => Program::query()
                ->withCount(['courses', 'offers'])
                ->latest()
                ->get()
                ->map(fn (Program $program): array => [
                    'id' => $program->id,
                    'name' => $program->name,
                    'audience' => $program->audience,
                    'courseCount' => $program->courses_count,
                    'offerCount' => $program->offers_count,
                    'defaultPriceCents' => $program->default_price_cents,
                    'active' => $program->active,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Programs/Form', $this->formData());
    }

    public function store(StoreProgramRequest $request): RedirectResponse
    {
        $program = DB::transaction(function () use ($request): Program {
            $data = $request->validated();
            $program = Program::query()->create(collect($data)->except('course_ids')->all());
            $program->courses()->sync($data['course_ids']);

            return $program;
        });

        return redirect()->route('admin.programs.edit', $program)->with('success', 'Programa criado.');
    }

    public function edit(Program $program): Response
    {
        return Inertia::render('Admin/Programs/Form', [
            ...$this->formData(),
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'description' => $program->description,
                'audience' => $program->audience,
                'defaultPriceCents' => $program->default_price_cents,
                'active' => $program->active,
                'courseIds' => $program->courses()->pluck('courses.id')->all(),
            ],
        ]);
    }

    public function update(UpdateProgramRequest $request, Program $program): RedirectResponse
    {
        DB::transaction(function () use ($request, $program): void {
            $data = $request->validated();
            $program->update(collect($data)->except('course_ids')->all());
            $program->courses()->sync($data['course_ids']);
        });

        return back()->with('success', 'Programa atualizado.');
    }

    /** @return array{courses: mixed} */
    private function formData(): array
    {
        return [
            'courses' => Course::query()->published()->orderBy('title')->get(['id', 'title', 'category']),
        ];
    }
}
