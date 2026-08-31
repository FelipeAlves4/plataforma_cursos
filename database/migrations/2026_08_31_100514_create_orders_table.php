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
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('offer_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('INFINITEPAY')->index();
            $table->string('order_nsu')->unique();
            $table->text('checkout_url')->nullable();
            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3)->default('BRL');
            $table->string('status')->default('PENDING')->index();
            $table->string('provider_transaction_id')->nullable()->index();
            $table->string('provider_invoice_slug')->nullable();
            $table->text('provider_receipt_url')->nullable();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamp('failed_at')->nullable();
            $table->json('provider_payload')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['offer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
