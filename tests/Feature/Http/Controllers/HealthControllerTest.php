<?php

namespace Tests\Feature\Http\Controllers;

use Tests\TestCase;

class HealthControllerTest extends TestCase
{
    public function test_health_endpoint_returns_only_the_public_status(): void
    {
        $this->getJson('/health')
            ->assertOk()
            ->assertExactJson(['status' => 'ok'])
            ->assertHeader('Content-Security-Policy', "frame-ancestors 'self'")
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    }
}
