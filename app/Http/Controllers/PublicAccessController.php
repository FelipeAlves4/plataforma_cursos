<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetPublicAccessPasswordRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
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
        $this->ensureActivationIsAvailable($order);
        $order->user->update(['password' => $request->validated('password')]);
        $order->update(['activation_used_at' => now()]);

        Auth::login($order->user);
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
