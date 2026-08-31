<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OfferStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOfferRequest;
use App\Models\Offer;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    public function create(Request $request): Response
    {
        $selectedProgramId = Program::query()
            ->active()
            ->whereKey($request->integer('program_id'))
            ->value('id');

        return Inertia::render('Admin/Offers/Create', [
            'selectedProgramId' => $selectedProgramId,
            'students' => User::query()->where('role', UserRole::Student)->orderBy('name')->get(['id', 'name', 'email']),
            'programs' => Program::query()->active()->with('courses:id,title')->orderBy('name')->get()->map(fn (Program $program): array => [
                'id' => $program->id,
                'name' => $program->name,
                'defaultPriceCents' => $program->default_price_cents,
                'courses' => $program->courses->map->only('id', 'title')->values(),
            ]),
        ]);
    }

    public function store(StoreOfferRequest $request): RedirectResponse
    {
        $offer = DB::transaction(function () use ($request): Offer {
            $data = $request->validated();
            $program = Program::query()->with('courses:id')->findOrFail($data['program_id']);

            if ($program->courses->isEmpty()) {
                abort(422, 'O programa precisa ter ao menos um curso publicado.');
            }

            $offer = Offer::query()->create([
                ...collect($data)->except('program_id')->all(),
                'program_id' => $program->id,
                'created_by' => $request->user()->id,
                'program_name_snapshot' => $program->name,
            ]);
            $offer->courses()->attach($program->courses->pluck('id'));

            return $offer;
        });

        return redirect()->route('admin.offers.show', $offer)->with('success', 'Oferta criada e aguardando pagamento.');
    }

    public function show(Offer $offer): Response
    {
        $offer->load(['user:id,name,email', 'courses:id,title', 'orders' => fn ($query) => $query->latest()]);
        $pendingOrder = $offer->orders->first(fn ($order) => $order->checkout_url !== null);

        return Inertia::render('Admin/Offers/Show', [
            'offer' => [
                'id' => $offer->id,
                'programName' => $offer->program_name_snapshot,
                'priceCents' => $offer->price_cents,
                'status' => $offer->status->value,
                'expiresAt' => $offer->expires_at?->toDateTimeString(),
                'student' => $offer->user->only('id', 'name', 'email'),
                'courses' => $offer->courses->map->only('id', 'title')->values(),
                'checkoutUrl' => $pendingOrder?->checkout_url,
            ],
        ]);
    }

    public function destroy(Offer $offer): RedirectResponse
    {
        abort_unless($offer->status === OfferStatus::Pending, 422);
        $offer->update(['status' => OfferStatus::Cancelled]);

        return redirect()->route('admin.sales.index')->with('success', 'Oferta cancelada.');
    }
}
