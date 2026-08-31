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
            ->with(['user:id,name,email', 'offer:id,program_name_snapshot'])
            ->when($status !== 'ALL', fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        return Inertia::render('Admin/Sales/Index', [
            'status' => $status,
            'sales' => $orders->map(fn (Order $order): array => [
                'id' => $order->id,
                'student' => $order->user->only('name', 'email'),
                'programName' => $order->offer->program_name_snapshot,
                'amountCents' => $order->amount_cents,
                'status' => $order->status->value,
                'createdAt' => $order->created_at->toDateTimeString(),
                'paidAt' => $order->paid_at?->toDateTimeString(),
            ]),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user:id,name,email', 'offer.courses:id,title']);

        return Inertia::render('Admin/Sales/Show', [
            'sale' => [
                'id' => $order->id,
                'orderNsu' => $order->order_nsu,
                'programName' => $order->offer->program_name_snapshot,
                'amountCents' => $order->amount_cents,
                'status' => $order->status->value,
                'student' => $order->user->only('name', 'email'),
                'courses' => $order->offer->courses->map->only('id', 'title')->values(),
                'transactionId' => $order->provider_transaction_id,
                'createdAt' => $order->created_at->toDateTimeString(),
                'paidAt' => $order->paid_at?->toDateTimeString(),
            ],
        ]);
    }
}
