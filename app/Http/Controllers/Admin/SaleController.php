<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->validate(['status' => ['nullable', 'string', 'in:ALL,PENDING,PAID,FAILED,CANCELLED,REFUNDED']])['status'] ?? 'ALL';
        $orders = Order::query()
            ->with(['user:id,name,email', 'checkoutLead:id,name,email,checkout_link_id', 'offer:id,program_name_snapshot'])
            ->when($status !== 'ALL', fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        return Inertia::render('Admin/Sales/Index', [
            'status' => $status,
            'sales' => $orders->map(function (Order $order): array {
                $customer = $order->user ?? $order->checkoutLead;

                return [
                    'id' => $order->id,
                    'student' => ['name' => $customer?->name ?? '—', 'email' => $customer?->email ?? '—'],
                    'programName' => $order->program_name_snapshot ?? $order->offer?->program_name_snapshot ?? '—',
                    'amountCents' => $order->amount_cents,
                    'status' => $order->status->value,
                    'createdAt' => $order->created_at->toDateTimeString(),
                    'paidAt' => $order->paid_at?->toDateTimeString(),
                ];
            }),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user:id,name,email', 'checkoutLead:id,name,email,checkout_link_id', 'offer.courses:id,title', 'courses:id,title']);

        $customer = $order->user ?? $order->checkoutLead;

        return Inertia::render('Admin/Sales/Show', [
            'sale' => [
                'id' => $order->id,
                'orderNsu' => $order->order_nsu,
                'programName' => $order->program_name_snapshot ?? $order->offer?->program_name_snapshot ?? '—',
                'amountCents' => $order->amount_cents,
                'status' => $order->status->value,
                'student' => ['name' => $customer?->name ?? '—', 'email' => $customer?->email ?? '—'],
                'courses' => ($order->isPublicCheckout() ? $order->courses : $order->offer?->courses ?? collect())
                    ->map->only('id', 'title')
                    ->values(),
                'transactionId' => $order->provider_transaction_id,
                'createdAt' => $order->created_at->toDateTimeString(),
                'paidAt' => $order->paid_at?->toDateTimeString(),
            ],
        ]);
    }
}
