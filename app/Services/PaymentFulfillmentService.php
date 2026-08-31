<?php

namespace App\Services;

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Models\Enrollment;
use App\Models\Offer;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class PaymentFulfillmentService
{
    /** @param array<string, mixed> $providerPayload */
    public function fulfill(
        Order $order,
        string $transactionNsu,
        string $invoiceSlug,
        ?string $receiptUrl,
        array $providerPayload,
    ): Order {
        return DB::transaction(function () use ($order, $transactionNsu, $invoiceSlug, $receiptUrl, $providerPayload): Order {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($lockedOrder->status === OrderStatus::Paid) {
                return $lockedOrder;
            }

            if ($lockedOrder->status !== OrderStatus::Pending) {
                throw new \RuntimeException('O pedido não pode mais ser confirmado.');
            }

            $offer = Offer::query()->lockForUpdate()->findOrFail($lockedOrder->offer_id);

            if ($offer->status !== OfferStatus::Pending) {
                throw new \RuntimeException('A oferta não pode mais ser confirmada.');
            }

            $lockedOrder->update([
                'status' => OrderStatus::Paid,
                'provider_transaction_id' => $transactionNsu,
                'provider_invoice_slug' => $invoiceSlug,
                'provider_receipt_url' => $receiptUrl,
                'provider_payload' => $providerPayload,
                'paid_at' => now(),
            ]);
            $offer->update([
                'status' => OfferStatus::Paid,
                'accepted_at' => now(),
            ]);

            $offer->courses()->pluck('courses.id')->each(function (int $courseId) use ($offer): void {
                Enrollment::query()->firstOrCreate(
                    ['user_id' => $offer->user_id, 'course_id' => $courseId],
                    ['enrolled_at' => now()],
                );
            });

            return $lockedOrder->refresh();
        }, attempts: 3);
    }
}
