<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseModuleRequest;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseModuleController extends Controller
{
    public function store(CourseModuleRequest $request, Course $course): RedirectResponse
    {
        $course->modules()->create($request->validated());

        return back()->with('success', 'Módulo criado.');
    }

    public function update(CourseModuleRequest $request, CourseModule $module): RedirectResponse
    {
        $module->update($request->validated());

        return back()->with('success', 'Módulo atualizado.');
    }

    public function destroy(CourseModule $module): RedirectResponse
    {
        $module->delete();

        return back()->with('success', 'Módulo excluído.');
    }

    public function reorder(Request $request, Course $course): RedirectResponse
    {
        $ids = $request->validate([
            'module_ids' => ['required', 'array'],
            'module_ids.*' => ['integer', 'distinct'],
        ])['module_ids'];

        abort_unless($course->modules()->whereIn('id', $ids)->count() === count($ids), 422);

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $position => $id) {
                CourseModule::query()->whereKey($id)->update(['position' => 1000000 + $position]);
            }

            foreach ($ids as $position => $id) {
                CourseModule::query()->whereKey($id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Ordem dos módulos atualizada.');
    }
}
