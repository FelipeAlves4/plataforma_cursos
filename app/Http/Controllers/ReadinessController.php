<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReadinessController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();

            return response()->json(['status' => 'ok']);
        } catch (Throwable) {
            Log::warning('Readiness check failed because the database is unavailable.');

            return response()->json(['status' => 'unavailable'], 503);
        }
    }
}
