<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InfinitePayService
{
    private const BaseUrl = 'https://api.checkout.infinitepay.io';

    /** @return array{url: string} */
    public function createCheckout(Order $order): array
    {
        $order->loadMissing('offer', 'user', 'checkoutLead');
        $description = $order->program_name_snapshot ?? $order->offer?->program_name_snapshot;
        $customer = $order->checkoutLead ?? $order->user;

        if ($description === null || $customer === null) {
            throw new \LogicException('O pedido não possui dados comerciais suficientes para iniciar o checkout.');
        }

        $response = $this->request()->post(self::BaseUrl.'/links', array_filter([
            'handle' => $this->handle(),
            'redirect_url' => $this->requiredConfig('redirect_url'),
            'webhook_url' => $this->requiredConfig('webhook_url'),
            'order_nsu' => $order->order_nsu,
            'items' => [[
                'quantity' => 1,
                'price' => $order->amount_cents,
                'description' => $description,
            ]],
            'customer' => array_filter([
                'name' => $customer->name,
                'email' => $customer->email,
                'phone_number' => $customer->phone,
            ]),
        ]));

        if (! $response->successful() || ! is_string($response->json('url')) || $response->json('url') === '') {
            Log::warning('InfinitePay checkout creation failed.', [
                'order_nsu' => $order->order_nsu,
                'http_status' => $response->status(),
            ]);

            throw new \RuntimeException('Não foi possível criar o checkout da InfinitePay.');
        }

        return ['url' => $response->json('url')];
    }

    /**
     * @return array{amount: int, capture_method: string|null, installments: int|null, paid_amount: int|null}|null
     */
    public function checkPayment(Order $order, string $transactionNsu, string $invoiceSlug): ?array
    {
        $response = $this->request()->post(self::BaseUrl.'/payment_check', [
            'handle' => $this->handle(),
            'order_nsu' => $order->order_nsu,
            'transaction_nsu' => $transactionNsu,
            'slug' => $invoiceSlug,
        ]);

        if (! $response->successful()) {
            Log::warning('InfinitePay payment verification failed.', [
                'order_nsu' => $order->order_nsu,
                'http_status' => $response->status(),
            ]);

            return null;
        }

        $payload = $response->json();

        if (! is_array($payload)
            || Arr::get($payload, 'success') !== true
            || Arr::get($payload, 'paid') !== true
            || (int) Arr::get($payload, 'amount') !== $order->amount_cents) {
            Log::warning('InfinitePay payment verification did not confirm the expected payment.', [
                'order_nsu' => $order->order_nsu,
            ]);

            return null;
        }

        return [
            'amount' => (int) $payload['amount'],
            'capture_method' => is_string($payload['capture_method'] ?? null) ? $payload['capture_method'] : null,
            'installments' => is_int($payload['installments'] ?? null) ? $payload['installments'] : null,
            'paid_amount' => is_int($payload['paid_amount'] ?? null) ? $payload['paid_amount'] : null,
        ];
    }

    private function request(): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->timeout(10)
            ->connectTimeout(3)
            ->retry([100, 300]);
    }

    private function handle(): string
    {
        return $this->requiredConfig('handle');
    }

    private function requiredConfig(string $key): string
    {
        $value = config('services.infinitepay.'.$key);

        if (! is_string($value) || $value === '') {
            throw new \RuntimeException('A integração InfinitePay não está configurada.');
        }

        return $value;
    }
}
