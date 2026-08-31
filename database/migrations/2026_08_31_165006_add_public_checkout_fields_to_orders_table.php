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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('offer_id')->nullable()->change();
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('checkout_link_id')->nullable()->after('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('checkout_lead_id')->nullable()->after('checkout_link_id')->constrained()->restrictOnDelete();
            $table->foreignId('program_id')->nullable()->after('checkout_lead_id')->constrained()->restrictOnDelete();
            $table->string('program_name_snapshot')->nullable()->after('program_id');
            $table->timestamp('activation_expires_at')->nullable()->after('failed_at');
            $table->timestamp('activation_used_at')->nullable()->after('activation_expires_at');

            $table->index(['checkout_link_id', 'status']);
            $table->index(['checkout_lead_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['checkout_link_id', 'status']);
            $table->dropIndex(['checkout_lead_id', 'status']);
            $table->dropConstrainedForeignId('checkout_link_id');
            $table->dropConstrainedForeignId('checkout_lead_id');
            $table->dropConstrainedForeignId('program_id');
            $table->dropColumn(['program_name_snapshot', 'activation_expires_at', 'activation_used_at']);
            $table->foreignId('offer_id')->nullable(false)->change();
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
