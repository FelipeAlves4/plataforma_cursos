<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function show(Request $request, Lesson $lesson, CertificateService $certificates): Response
    {
        $this->authorize('view', $lesson);

        $lesson->load(['module.course.instructor', 'module.course.modules.lessons']);
        $course = $lesson->module->course;

        $orderedLessons = $course->modules->flatMap->lessons->values();
        $lessonPositions = $orderedLessons->pluck('id')->flip();

        LessonProgress::query()->firstOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['started_at' => now(), 'last_accessed_at' => now()],
        );
        LessonProgress::query()->where('user_id', $request->user()->id)->where('lesson_id', $lesson->id)->update(['last_accessed_at' => now()]);

        $completedLessonIds = LessonProgress::query()
            ->where('user_id', $request->user()->id)
            ->where('completed', true)
            ->whereIn('lesson_id', $orderedLessons->pluck('id'))
            ->pluck('lesson_id')
            ->all();

        $position = $orderedLessons->search(fn ($item) => $item->id === $lesson->id);
        $totalLessons = $orderedLessons->count();
        $completedLessons = count($completedLessonIds);
        $certificate = Certificate::query()
            ->whereBelongsTo($request->user())
            ->whereBelongsTo($course)
            ->first();

        return Inertia::render('Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'videoProvider' => $lesson->video_provider->value,
                'videoId' => $lesson->video_id,
                'videoUrl' => $lesson->video_url,
                'durationSeconds' => $lesson->duration_seconds,
                'completed' => in_array($lesson->id, $completedLessonIds, true),
                'number' => $position !== false ? $position + 1 : 1,
            ],
            'course' => [
                'title' => $course->title,
                'slug' => $course->slug,
                'instructor' => $course->instructor?->name,
                'category' => $course->category,
                'level' => $course->level,
                'progress' => [
                    'completedLessons' => $completedLessons,
                    'totalLessons' => $totalLessons,
                    'percentage' => $totalLessons > 0 ? (int) round(($completedLessons / $totalLessons) * 100) : 0,
                ],
                'certificate' => [
                    'enabled' => $course->certificate_enabled,
                    'eligible' => ! $certificate && $certificates->isEligible($request->user(), $course),
                    'downloadUrl' => $certificate ? route('certificates.download', $certificate) : null,
                    'issueUrl' => route('courses.certificate.store', $course),
                ],
                'modules' => $course->modules->map(fn ($module) => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'position' => $module->position,
                    'lessons' => $module->lessons->map(fn ($courseLesson) => [
                        'id' => $courseLesson->id,
                        'title' => $courseLesson->title,
                        'videoId' => $courseLesson->video_id,
                        'durationSeconds' => $courseLesson->duration_seconds,
                        'completed' => in_array($courseLesson->id, $completedLessonIds, true),
                        'number' => $lessonPositions[$courseLesson->id] + 1,
                    ]),
                ]),
            ],
            'navigation' => [
                'previousLessonId' => $position !== false ? $orderedLessons->get($position - 1)?->id : null,
                'nextLessonId' => $position !== false ? $orderedLessons->get($position + 1)?->id : null,
            ],
        ]);
    }
}
