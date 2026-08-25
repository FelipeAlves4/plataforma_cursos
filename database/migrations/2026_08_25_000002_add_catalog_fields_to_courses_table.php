<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->string('category')->nullable()->index()->after('description');
            $table->string('level')->nullable()->index()->after('category');
            $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete()->after('level');
            $table->unsignedInteger('estimated_duration_minutes')->nullable()->after('instructor_id');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('instructor_id');
            $table->dropColumn(['category', 'level', 'estimated_duration_minutes']);
        });
    }
};
