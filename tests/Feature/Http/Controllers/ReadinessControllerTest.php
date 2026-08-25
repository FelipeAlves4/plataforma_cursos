<?php

namespace Tests\Feature\Http\Controllers;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class ReadinessControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_readiness_endpoint_returns_ok_when_the_database_is_available(): void
    {
        $this->getJson('/ready')
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_readiness_endpoint_returns_503_without_exposing_database_details(): void
    {
        DB::shouldReceive('connection')
            ->once()
            ->andThrow(new RuntimeException('sensitive database details'));

        $this->getJson('/ready')
            ->assertServiceUnavailable()
            ->assertExactJson(['status' => 'unavailable']);
    }
}
