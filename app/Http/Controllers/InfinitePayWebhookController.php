<?php

namespace App\Http\Controllers;

use App\Http\Requests\InfinitePayWebhookRequest;
use App\Models\Order;
use App\Services\InfinitePayService;
use App\Services\PaymentFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InfinitePayWebhookController extends Controller
{
    public function __invoke(
        InfinitePayWebhookRequest $request,
        InfinitePayService $infinitePay,
        PaymentFulfillmentService $fulfillment,
    ): JsonResponse {
        $data = $request->validated();
        $order = Order::query()->where('order_nsu', $data['order_nsu'])->first();

        if ($order === null || $order->amount_cents !== $data['amount']) {
            Log::warning('InfinitePay webhook could not be matched to an order.', [
                'order_nsu' => $data['order_nsu'],
            ]);

            return response()->json(['message' => 'Pedido inválido.'], 400);
        }

        try {
            $verification = $infinitePay->checkPayment($order, $data['transaction_nsu'], $data['invoice_slug']);

            if ($verification === null) {
                return response()->json(['message' => 'Pagamento não confirmado.'], 400);
            }

            $fulfillment->fulfill(
                $order,
                $data['transaction_nsu'],
                $data['invoice_slug'],
                $data['receipt_url'] ?? null,
                $verification,
            );
        } catch (\Throwable $exception) {
            Log::error('InfinitePay webhook fulfillment failed.', [
                'order_nsu' => $data['order_nsu'],
                'exception' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'Não foi possível processar o pagamento.'], 400);
        }

        return response()->json(['message' => 'Pagamento processado.']);
    }
}
