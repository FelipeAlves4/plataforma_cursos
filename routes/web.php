<?php

use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CourseModuleController as AdminCourseModuleController;
use App\Http\Controllers\Admin\CoursePreviewController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/my-courses', [CourseController::class, 'myCourses'])->name('courses.my');
    Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::put('/lessons/{lesson}/progress', [LessonProgressController::class, 'update'])
        ->name('lessons.progress.update');
});

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'role:ADMIN'])
    ->group(function (): void {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::resource('courses', AdminCourseController::class)->except('show');
        Route::get('courses/{course}/preview', CoursePreviewController::class)->name('courses.preview');
        Route::post('courses/{course}/modules', [AdminCourseModuleController::class, 'store'])->name('courses.modules.store');
        Route::put('courses/{course}/modules/reorder', [AdminCourseModuleController::class, 'reorder'])->name('courses.modules.reorder');
        Route::put('modules/{module}', [AdminCourseModuleController::class, 'update'])->name('modules.update');
        Route::delete('modules/{module}', [AdminCourseModuleController::class, 'destroy'])->name('modules.destroy');
        Route::post('modules/{module}/lessons', [AdminLessonController::class, 'store'])->name('modules.lessons.store');
        Route::put('modules/{module}/lessons/reorder', [AdminLessonController::class, 'reorder'])->name('modules.lessons.reorder');
        Route::put('lessons/{lesson}', [AdminLessonController::class, 'update'])->name('lessons.update');
        Route::delete('lessons/{lesson}', [AdminLessonController::class, 'destroy'])->name('lessons.destroy');
        Route::get('courses/{course}/students', [AdminStudentController::class, 'index'])->name('courses.students.index');
        Route::post('courses/{course}/enrollments', [AdminStudentController::class, 'store'])->name('courses.enrollments.store');
        Route::delete('courses/{course}/enrollments/{enrollment}', [AdminStudentController::class, 'destroy'])->name('courses.enrollments.destroy');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
