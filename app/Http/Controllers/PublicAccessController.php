<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetPublicAccessPasswordRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PublicAccessController extends Controller
{
    public function create(Order $order): Response
    {
        $this->ensureActivationIsAvailable($order);

        return Inertia::render('Checkout/SetPassword', [
            'action' => request()->fullUrl(),
            'email' => $order->user->email,
        ]);
    }

    public function store(SetPublicAccessPasswordRequest $request, Order $order): RedirectResponse
    {
        $userId = DB::transaction(function () use ($request, $order): int {
            $lockedOrder = Order::query()
                ->with('user')
                ->lockForUpdate()
                ->findOrFail($order->id);
            $this->ensureActivationIsAvailable($lockedOrder);

            $lockedOrder->user->forceFill([
                'password' => $request->validated('password'),
                'email_verified_at' => now(),
            ])->save();
            $lockedOrder->update(['activation_used_at' => now()]);

            return $lockedOrder->user_id;
        }, attempts: 3);

        Auth::loginUsingId($userId);
        $request->session()->regenerate();

        return redirect()->route('courses.my')->with('success', 'Senha criada. Seu acesso está pronto.');
    }

    private function ensureActivationIsAvailable(Order $order): void
    {
        abort_unless(
            $order->isPublicCheckout()
            && $order->status->value === 'PAID'
            && $order->user !== null
            && $order->activation_used_at === null
            && $order->activation_expires_at?->isFuture(),
            404,
        );
    }
}
