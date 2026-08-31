<?php

namespace App\Services;

use App\Enums\OfferStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Enrollment;
use App\Models\Offer;
use App\Models\Order;
use App\Models\User;
use App\Notifications\CheckoutAccessReady;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
        $activationOrder = null;

        $fulfilledOrder = DB::transaction(function () use ($order, $transactionNsu, $invoiceSlug, $receiptUrl, $providerPayload, &$activationOrder): Order {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ($lockedOrder->status === OrderStatus::Paid) {
                return $lockedOrder;
            }

            if ($lockedOrder->status !== OrderStatus::Pending) {
                throw new \RuntimeException('O pedido não pode mais ser confirmado.');
            }

            if ($lockedOrder->isPublicCheckout()) {
                return $this->fulfillPublicCheckout(
                    $lockedOrder,
                    $transactionNsu,
                    $invoiceSlug,
                    $receiptUrl,
                    $providerPayload,
                    $activationOrder,
                );
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

        if ($activationOrder instanceof Order) {
            $activationOrder->user->notify(new CheckoutAccessReady($activationOrder));
        }

        return $fulfilledOrder;
    }

    /**
     * @param  array<string, mixed>  $providerPayload
     */
    private function fulfillPublicCheckout(
        Order $order,
        string $transactionNsu,
        string $invoiceSlug,
        ?string $receiptUrl,
        array $providerPayload,
        ?Order &$activationOrder,
    ): Order {
        $order->loadMissing('checkoutLead', 'courses');
        $lead = $order->checkoutLead;

        if ($lead === null || $order->courses->isEmpty()) {
            throw new \RuntimeException('O pedido público não possui dados suficientes para liberação.');
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$lead->email_normalized])
            ->first();
        $isNewUser = $user === null;

        if ($user === null) {
            $user = new User([
                'name' => $lead->name,
                'email' => $lead->email_normalized,
                'password' => Str::password(48),
                'role' => UserRole::Student,
                'phone' => $lead->phone,
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $order->update([
            'user_id' => $user->id,
            'status' => OrderStatus::Paid,
            'provider_transaction_id' => $transactionNsu,
            'provider_invoice_slug' => $invoiceSlug,
            'provider_receipt_url' => $receiptUrl,
            'provider_payload' => $providerPayload,
            'paid_at' => now(),
            'activation_expires_at' => $isNewUser ? now()->addHours(24) : null,
        ]);

        $order->courses->each(function ($course) use ($user): void {
            Enrollment::query()->firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $course->id],
                ['enrolled_at' => now()],
            );
        });

        $fulfilledOrder = $order->fresh(['user']);

        if ($isNewUser) {
            $activationOrder = $fulfilledOrder;
        }

        return $fulfilledOrder;
    }
}
