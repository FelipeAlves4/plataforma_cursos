<?php

use App\Http\Controllers\Admin\CheckoutLinkController as AdminCheckoutLinkController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CourseModuleController as AdminCourseModuleController;
use App\Http\Controllers\Admin\CoursePreviewController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Admin\OfferController as AdminOfferController;
use App\Http\Controllers\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Admin\SaleController as AdminSaleController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InfinitePayWebhookController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\OfferCheckoutController;
use App\Http\Controllers\OrderStatusController;
use App\Http\Controllers\PaymentReturnController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicAccessController;
use App\Http\Controllers\PublicCheckoutController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/certificates/verify/{verificationCode}', [CertificateController::class, 'verify'])
    ->name('certificates.verify');

Route::post('/webhooks/infinitepay', InfinitePayWebhookController::class)
    ->name('webhooks.infinitepay');

Route::get('/checkout/{token}', [PublicCheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout/{token}', [PublicCheckoutController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('checkout.store');
Route::get('/payments/infinitepay/return', PaymentReturnController::class)->name('payments.infinitepay.return');
Route::get('/checkout/access/{order}', [PublicAccessController::class, 'create'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('checkout.access.create');
Route::post('/checkout/access/{order}', [PublicAccessController::class, 'store'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('checkout.access.store');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/my-courses', [CourseController::class, 'myCourses'])->name('courses.my');
    Route::get('/courses/{course:slug}', [CourseController::class, 'show'])->name('courses.show');
    Route::post('/courses/{course}/certificate', [CertificateController::class, 'store'])->name('courses.certificate.store');
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::put('/lessons/{lesson}/progress', [LessonProgressController::class, 'update'])
        ->name('lessons.progress.update');
    Route::post('/offers/{offer}/checkout', OfferCheckoutController::class)->name('offers.checkout');
    Route::get('/orders/{order}/status', OrderStatusController::class)->name('orders.status');
});

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'role:ADMIN'])
    ->group(function (): void {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::resource('courses', AdminCourseController::class)->except('show');
        Route::resource('programs', AdminProgramController::class)->except(['show', 'destroy']);
        Route::get('checkout-links', [AdminCheckoutLinkController::class, 'index'])->name('checkout-links.index');
        Route::post('checkout-links', [AdminCheckoutLinkController::class, 'store'])->name('checkout-links.store');
        Route::patch('checkout-links/{checkoutLink}', [AdminCheckoutLinkController::class, 'update'])->name('checkout-links.update');
        Route::get('offers/create', [AdminOfferController::class, 'create'])->name('offers.create');
        Route::post('offers', [AdminOfferController::class, 'store'])->name('offers.store');
        Route::get('offers/{offer}', [AdminOfferController::class, 'show'])->name('offers.show');
        Route::delete('offers/{offer}', [AdminOfferController::class, 'destroy'])->name('offers.destroy');
        Route::get('sales', [AdminSaleController::class, 'index'])->name('sales.index');
        Route::get('sales/{order}', [AdminSaleController::class, 'show'])->name('sales.show');
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
