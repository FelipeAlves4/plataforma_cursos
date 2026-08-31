<?php

namespace App\Enums;

enum OfferStatus: string
{
    case Pending = 'PENDING';
    case Paid = 'PAID';
    case Cancelled = 'CANCELLED';
    case Expired = 'EXPIRED';
}
