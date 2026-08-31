<?php

namespace App\Models;

use App\Enums\OrderProvider;
use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['offer_id', 'user_id', 'checkout_link_id', 'checkout_lead_id', 'program_id', 'program_name_snapshot', 'provider', 'order_nsu', 'checkout_url', 'amount_cents', 'currency', 'status', 'provider_transaction_id', 'provider_invoice_slug', 'provider_receipt_url', 'paid_at', 'failed_at', 'activation_expires_at', 'activation_used_at', 'provider_payload'])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $attributes = [
        'provider' => OrderProvider::InfinitePay->value,
        'currency' => 'BRL',
        'status' => OrderStatus::Pending->value,
    ];

    protected function casts(): array
    {
        return [
            'provider' => OrderProvider::class,
            'status' => OrderStatus::class,
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'activation_expires_at' => 'datetime',
            'activation_used_at' => 'datetime',
            'provider_payload' => 'array',
        ];
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checkoutLink(): BelongsTo
    {
        return $this->belongsTo(CheckoutLink::class);
    }

    public function checkoutLead(): BelongsTo
    {
        return $this->belongsTo(CheckoutLead::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'order_course')->withTimestamps();
    }

    public function isPublicCheckout(): bool
    {
        return $this->checkout_link_id !== null;
    }
}
