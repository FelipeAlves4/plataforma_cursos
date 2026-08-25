<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('phone')->nullable()->after('email');
            $table->string('job_title')->nullable()->after('phone');
            $table->string('company')->nullable()->after('job_title');
            $table->string('business_segment')->nullable()->after('company');
            $table->string('city')->nullable()->after('business_segment');
            $table->string('state', 2)->nullable()->after('city');
            $table->string('avatar_path')->nullable()->after('state');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['phone', 'job_title', 'company', 'business_segment', 'city', 'state', 'avatar_path']));
    }
};
