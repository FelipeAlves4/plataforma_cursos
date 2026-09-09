<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCheckoutLinkRequest;
use App\Http\Requests\Admin\UpdateCheckoutLinkRequest;
use App\Models\CheckoutLink;
use App\Models\Order;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutLinkController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedProgramId = $request->integer('program_id') ?: null;
        $paidOrders = Order::query()
            ->whereNotNull('checkout_link_id')
            ->where('status', OrderStatus::Paid->value);

        return Inertia::render('Admin/CheckoutLinks/Index', [
            'selectedProgramId' => $selectedProgramId,
            'shouldOpenCreate' => $request->boolean('create'),
            'programs' => Program::query()
                ->active()
                ->withCount('courses')
                ->orderBy('name')
                ->get(['id', 'name', 'default_price_cents'])
                ->map(fn (Program $program): array => [
                    'id' => $program->id,
                    'name' => $program->name,
                    'defaultPriceCents' => $program->default_price_cents,
                    'courseCount' => $program->courses_count,
                ]),
            'summary' => [
                'activeLinks' => CheckoutLink::query()->available()->count(),
                'confirmedSales' => (clone $paidOrders)->count(),
                'revenueCents' => (int) (clone $paidOrders)->sum('amount_cents'),
            ],
            'links' => CheckoutLink::query()
                ->with('program:id,name')
                ->withCount(['orders as sales_count' => fn ($query) => $query->where('status', OrderStatus::Paid->value)])
                ->withSum(['orders as revenue_cents' => fn ($query) => $query->where('status', OrderStatus::Paid->value)], 'amount_cents')
                ->latest('id')
                ->get()
                ->map(fn (CheckoutLink $checkoutLink): array => $this->linkPayload($checkoutLink)),
        ]);
    }

    public function store(StoreCheckoutLinkRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->active()->findOrFail($data['program_id']);

        $this->createLink($program, $data, $request->user()->id);

        return back()->with('success', 'Link de venda criado.');
    }

    public function update(UpdateCheckoutLinkRequest $request, CheckoutLink $checkoutLink): RedirectResponse
    {
        $checkoutLink->update($request->validated());

        return back()->with('success', $checkoutLink->active ? 'Link ativado.' : 'Link desativado.');
    }

    public function duplicate(Request $request, CheckoutLink $checkoutLink): RedirectResponse
    {
        $program = Program::query()->active()->findOrFail($checkoutLink->program_id);

        $this->createLink($program, [
            'name' => $checkoutLink->name ? $checkoutLink->name.' (cópia)' : null,
            'program_id' => $checkoutLink->program_id,
            'price_cents' => $checkoutLink->price_cents,
            'expires_at' => $checkoutLink->expires_at?->isFuture() ? $checkoutLink->expires_at : null,
        ], $request->user()->id);

        return back()->with('success', 'Link duplicado.');
    }

    public function show(CheckoutLink $checkoutLink): Response
    {
        $checkoutLink->load('program:id,name');
        $checkoutLink->loadCount(['orders as sales_count' => fn ($query) => $query->where('status', OrderStatus::Paid->value)]);
        $checkoutLink->loadSum(['orders as revenue_cents' => fn ($query) => $query->where('status', OrderStatus::Paid->value)], 'amount_cents');
        $checkoutLink->load(['orders' => fn ($query) => $query
            ->where('status', OrderStatus::Paid->value)
            ->with(['user:id,name,email', 'checkoutLead:id,name,email,checkout_link_id'])
            ->latest('paid_at')
            ->limit(10)]);

        return Inertia::render('Admin/CheckoutLinks/Show', [
            'link' => [
                ...$this->linkPayload($checkoutLink),
                'createdAt' => $checkoutLink->created_at->toDateTimeString(),
                'latestSales' => $checkoutLink->orders->map(function (Order $order): array {
                    $customer = $order->user ?? $order->checkoutLead;

                    return [
                        'id' => $order->id,
                        'name' => $customer?->name ?? '—',
                        'email' => $customer?->email ?? '—',
                        'amountCents' => $order->amount_cents,
                        'paidAt' => $order->paid_at?->toDateTimeString() ?? $order->created_at->toDateTimeString(),
                        'status' => $order->status->value,
                    ];
                }),
            ],
        ]);
    }

    /** @param array{name?: string|null, program_id: int, price_cents: int, expires_at?: string|null} $data */
    private function createLink(Program $program, array $data, int $createdBy): CheckoutLink
    {
        return CheckoutLink::query()->create([
            ...$data,
            'slug' => Str::slug($program->name).'-'.Str::lower(Str::random(8)),
            'token' => Str::random(64),
            'active' => true,
            'created_by' => $createdBy,
        ]);
    }

    /** @return array{id: int, name: string, programId: int, programName: string, url: string, priceCents: int, active: bool, status: string, expiresAt: string|null, salesCount: int, revenueCents: int} */
    private function linkPayload(CheckoutLink $checkoutLink): array
    {
        return [
            'id' => $checkoutLink->id,
            'name' => $checkoutLink->name ?: $checkoutLink->program->name,
            'programId' => $checkoutLink->program_id,
            'programName' => $checkoutLink->program->name,
            'url' => route('checkout.show', $checkoutLink->token),
            'priceCents' => $checkoutLink->price_cents,
            'active' => $checkoutLink->active,
            'status' => $checkoutLink->expires_at?->isPast() ? 'EXPIRED' : ($checkoutLink->active ? 'ACTIVE' : 'INACTIVE'),
            'expiresAt' => $checkoutLink->expires_at?->toDateTimeString(),
            'salesCount' => $checkoutLink->sales_count,
            'revenueCents' => (int) ($checkoutLink->revenue_cents ?? 0),
        ];
    }
}
