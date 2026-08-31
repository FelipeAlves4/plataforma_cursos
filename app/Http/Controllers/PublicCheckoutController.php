<?php

namespace App\Http\Controllers;

use App\Enums\OrderProvider;
use App\Enums\OrderStatus;
use App\Http\Requests\StartPublicCheckoutRequest;
use App\Models\CheckoutLead;
use App\Models\CheckoutLink;
use App\Models\Order;
use App\Services\InfinitePayService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class PublicCheckoutController extends Controller
{
    public function show(string $token): InertiaResponse
    {
        $checkoutLink = CheckoutLink::query()
            ->available()
            ->with(['program.courses:id,title,description,estimated_duration_minutes'])
            ->where('token', $token)
            ->firstOrFail();

        return Inertia::render('Checkout/Show', [
            'checkout' => [
                'token' => $checkoutLink->token,
                'program' => [
                    'name' => $checkoutLink->program->name,
                    'description' => $checkoutLink->program->description,
                    'audience' => $checkoutLink->program->audience,
                    'courses' => $checkoutLink->program->courses->map(fn ($course): array => [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'estimatedDurationMinutes' => $course->estimated_duration_minutes,
                    ])->values(),
                ],
                'priceCents' => $checkoutLink->price_cents,
            ],
        ]);
    }

    public function store(StartPublicCheckoutRequest $request, string $token, InfinitePayService $infinitePay): Response
    {
        $data = $request->validated();
        $email = mb_strtolower(trim($data['email']));

        $order = DB::transaction(function () use ($token, $data, $email): Order {
            $checkoutLink = CheckoutLink::query()
                ->available()
                ->with('program.courses:id')
                ->lockForUpdate()
                ->where('token', $token)
                ->firstOrFail();

            if ($checkoutLink->program->courses->isEmpty()) {
                abort(422, 'Este programa não possui cursos disponíveis para venda.');
            }

            $lead = CheckoutLead::query()->firstOrNew([
                'checkout_link_id' => $checkoutLink->id,
                'email_normalized' => $email,
            ]);
            $lead->fill([
                'name' => trim($data['name']),
                'email' => trim($data['email']),
                'phone' => preg_replace('/\D/', '', $data['phone']) ?: trim($data['phone']),
            ]);
            $lead->save();

            $order = Order::query()
                ->where('checkout_link_id', $checkoutLink->id)
                ->where('checkout_lead_id', $lead->id)
                ->where('provider', OrderProvider::InfinitePay)
                ->where('status', OrderStatus::Pending)
                ->latest()
                ->first();

            if ($order !== null) {
                return $order;
            }

            $order = Order::query()->create([
                'checkout_link_id' => $checkoutLink->id,
                'checkout_lead_id' => $lead->id,
                'program_id' => $checkoutLink->program_id,
                'program_name_snapshot' => $checkoutLink->program->name,
                'provider' => OrderProvider::InfinitePay,
                'order_nsu' => 'ASEX-'.Str::upper((string) Str::ulid()),
                'amount_cents' => $checkoutLink->price_cents,
            ]);
            $order->courses()->sync($checkoutLink->program->courses->modelKeys());

            return $order;
        }, attempts: 3);

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
            Log::error('Public InfinitePay checkout creation failed.', [
                'order_nsu' => $order->order_nsu,
                'exception' => $exception->getMessage(),
            ]);

            return back()->withErrors(['checkout' => 'Não foi possível iniciar o pagamento. Revise seus dados e tente novamente.']);
        }

        return Inertia::location($order->checkout_url);
    }
}
