<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, AdminDashboardMetricsService $metrics): Response
    {
        $period = $request->validate([
            'period' => ['nullable', 'string', 'in:7d,30d,90d,year,all'],
        ])['period'] ?? '30d';

        return Inertia::render('Admin/Dashboard', [
            'dashboard' => $metrics->forPeriod($period),
        ]);
    }
}
