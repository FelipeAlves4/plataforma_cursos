<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\InfinitePayService;
use App\Services\PaymentFulfillmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReturnController extends Controller
{
    public function __invoke(Request $request, InfinitePayService $infinitePay, PaymentFulfillmentService $fulfillment): Response
    {
        $data = $request->validate([
            'order_nsu' => ['required', 'string', 'max:255'],
            'transaction_nsu' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'receipt_url' => ['nullable', 'url', 'max:2048'],
        ]);
        $order = Order::query()->where('order_nsu', $data['order_nsu'])->firstOrFail();

        if (! $order->isPublicCheckout()) {
            abort_unless($request->user()?->id === $order->user_id, 404);
        }

        if ($order->status === OrderStatus::Pending
            && isset($data['transaction_nsu'], $data['slug'])) {
            $this->confirm(
                $order,
                $data['transaction_nsu'],
                $data['slug'],
                $data['receipt_url'] ?? null,
                $infinitePay,
                $fulfillment,
            );
            $order->refresh();
        }

        if ($order->isPublicCheckout()) {
            return Inertia::render('Payments/PublicCheckoutReturn', [
                'order' => [
                    ...$this->orderData($order),
                    'accessUrl' => $this->activationUrl($order),
                    'loginUrl' => route('login'),
                ],
            ]);
        }

        return Inertia::render('Payments/InfinitePayReturn', [
            'order' => $this->orderData($order),
        ]);
    }

    private function confirm(
        Order $order,
        string $transactionNsu,
        string $invoiceSlug,
        ?string $receiptUrl,
        InfinitePayService $infinitePay,
        PaymentFulfillmentService $fulfillment,
    ): void {
        try {
            $verification = $infinitePay->checkPayment($order, $transactionNsu, $invoiceSlug);

            if ($verification !== null) {
                $fulfillment->fulfill($order, $transactionNsu, $invoiceSlug, $receiptUrl, $verification);
            }
        } catch (\Throwable $exception) {
            Log::warning('InfinitePay return could not be confirmed.', [
                'order_nsu' => $order->order_nsu,
                'exception' => $exception->getMessage(),
            ]);
        }
    }

    /** @return array{status: string, paidAt: string|null} */
    private function orderData(Order $order): array
    {
        return [
            'status' => $order->status->value,
            'paidAt' => $order->paid_at?->toDateTimeString(),
        ];
    }

    private function activationUrl(Order $order): ?string
    {
        if ($order->status !== OrderStatus::Paid
            || $order->activation_expires_at === null
            || ! $order->activation_expires_at->isFuture()
            || $order->activation_used_at !== null) {
            return null;
        }

        return URL::temporarySignedRoute(
            'checkout.access.create',
            $order->activation_expires_at,
            ['order' => $order],
        );
    }
}
