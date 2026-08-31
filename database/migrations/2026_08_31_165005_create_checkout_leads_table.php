<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('checkout_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkout_link_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('email_normalized')->index();
            $table->string('phone', 32);
            $table->timestamps();

            $table->unique(['checkout_link_id', 'email_normalized']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checkout_leads');
    }
};
