<?php

namespace App\Http\Controllers;

use App\Enums\OfferStatus;
use App\Enums\OrderProvider;
use App\Enums\OrderStatus;
use App\Models\Offer;
use App\Models\Order;
use App\Services\InfinitePayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class OfferCheckoutController extends Controller
{
    public function __invoke(Request $request, Offer $offer, InfinitePayService $infinitePay): Response
    {
        abort_unless($offer->user_id === $request->user()->id, 404);

        if ($offer->status === OfferStatus::Pending && ! $offer->isPayable()) {
            $offer->update(['status' => OfferStatus::Expired]);

            return back()->withErrors(['offer' => 'Esta oferta expirou.']);
        }

        if ($offer->status !== OfferStatus::Pending) {
            return back()->withErrors(['offer' => 'Esta oferta não está disponível para pagamento.']);
        }

        $order = DB::transaction(function () use ($offer, $request): Order {
            $lockedOffer = Offer::query()->lockForUpdate()->findOrFail($offer->id);

            if (! $lockedOffer->isPayable()) {
                abort(422, 'Esta oferta expirou.');
            }

            return $lockedOffer->orders()
                ->where('status', OrderStatus::Pending)
                ->where('provider', OrderProvider::InfinitePay)
                ->latest()
                ->first()
                ?? Order::query()->create([
                    'offer_id' => $lockedOffer->id,
                    'user_id' => $request->user()->id,
                    'provider' => OrderProvider::InfinitePay,
                    'order_nsu' => 'ASEX-'.Str::upper((string) Str::ulid()),
                    'amount_cents' => $lockedOffer->price_cents,
                ]);
        });

        if ($order->checkout_url !== null) {
            return Inertia::location($order->checkout_url);
        }

        try {
            $checkout = $infinitePay->createCheckout($order);
            $order->update(['checkout_url' => $checkout['url']]);
        } catch (\Throwable $exception) {
            $order->update([
                'status' => OrderStatus::Failed,
                'failed_at' => now(),
            ]);
            Log::error('InfinitePay checkout creation failed.', [
                'order_nsu' => $order->order_nsu,
                'exception' => $exception->getMessage(),
            ]);

            return back()->withErrors(['offer' => 'Não foi possível iniciar o pagamento. Tente novamente.']);
        }

        return Inertia::location($order->checkout_url);
    }
}
