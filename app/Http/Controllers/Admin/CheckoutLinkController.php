<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCheckoutLinkRequest;
use App\Http\Requests\Admin\UpdateCheckoutLinkRequest;
use App\Models\CheckoutLink;
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

        return Inertia::render('Admin/CheckoutLinks/Index', [
            'selectedProgramId' => $selectedProgramId,
            'programs' => Program::query()->active()->orderBy('name')->get(['id', 'name', 'default_price_cents']),
            'links' => CheckoutLink::query()
                ->with('program:id,name')
                ->withCount(['orders as sales_count' => fn ($query) => $query->where('status', 'PAID')])
                ->latest()
                ->get()
                ->map(fn (CheckoutLink $checkoutLink): array => [
                    'id' => $checkoutLink->id,
                    'programName' => $checkoutLink->program->name,
                    'url' => route('checkout.show', $checkoutLink->token),
                    'priceCents' => $checkoutLink->price_cents,
                    'active' => $checkoutLink->active,
                    'expiresAt' => $checkoutLink->expires_at?->toDateTimeString(),
                    'salesCount' => $checkoutLink->sales_count,
                ]),
        ]);
    }

    public function store(StoreCheckoutLinkRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $program = Program::query()->active()->findOrFail($data['program_id']);

        CheckoutLink::query()->create([
            ...$data,
            'slug' => Str::slug($program->name).'-'.Str::lower(Str::random(8)),
            'token' => Str::random(64),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Link de venda criado.');
    }

    public function update(UpdateCheckoutLinkRequest $request, CheckoutLink $checkoutLink): RedirectResponse
    {
        $checkoutLink->update($request->validated());

        return back()->with('success', $checkoutLink->active ? 'Link ativado.' : 'Link desativado.');
    }
}
