<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LessonRequest;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    public function store(LessonRequest $request, CourseModule $module): RedirectResponse
    {
        $module->lessons()->create($request->validated());

        return back()->with('success', 'Aula criada.');
    }

    public function update(LessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $lesson->update($request->validated());

        return back()->with('success', 'Aula atualizada.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $lesson->delete();

        return back()->with('success', 'Aula excluída.');
    }

    public function reorder(Request $request, CourseModule $module): RedirectResponse
    {
        $ids = $request->validate([
            'lesson_ids' => ['required', 'array'],
            'lesson_ids.*' => ['integer', 'distinct'],
        ])['lesson_ids'];

        abort_unless($module->lessons()->whereIn('id', $ids)->count() === count($ids), 422);

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $position => $id) {
                Lesson::query()->whereKey($id)->update(['position' => 1000000 + $position]);
            }

            foreach ($ids as $position => $id) {
                Lesson::query()->whereKey($id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Ordem das aulas atualizada.');
    }
}
