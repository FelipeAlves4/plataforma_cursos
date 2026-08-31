<?php

namespace App\Models;

use Database\Factories\CheckoutLeadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['checkout_link_id', 'name', 'email', 'email_normalized', 'phone'])]
class CheckoutLead extends Model
{
    /** @use HasFactory<CheckoutLeadFactory> */
    use HasFactory;

    public function checkoutLink(): BelongsTo
    {
        return $this->belongsTo(CheckoutLink::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
