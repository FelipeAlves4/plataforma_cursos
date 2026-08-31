import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Offer = {
    id: number;
    programName: string;
    priceCents: number;
    expiresAt?: string | null;
    courseCount: number;
};

function price(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export default function OfferCard({ offer }: { offer: Offer }) {
    const [processing, setProcessing] = useState(false);
    const checkoutError = usePage<{ errors: { offer?: string } }>().props.errors.offer;
    const expiresAt = offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString('pt-BR') : null;

    const checkout = (): void => {
        setProcessing(true);
        router.post(`/offers/${offer.id}/checkout`, {}, { onFinish: () => setProcessing(false) });
    };

    return <article className="offer-card relative overflow-hidden rounded-[1.35rem] border border-[#c28aff]/25 bg-[#17101f] p-6 shadow-[0_24px_64px_rgba(0,0,0,.22)] sm:p-7">
        <span aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[#8e42cf]/25 blur-3xl" />
        <span aria-hidden className="absolute bottom-0 right-0 h-40 w-2/3 bg-[radial-gradient(ellipse_at_bottom_right,rgba(153,75,224,.18),transparent_65%)]" />
        <div className="relative"><div className="flex items-center justify-between gap-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d7b5ff]">Selecionado para você</p><span className="border border-white/15 bg-black/15 px-2.5 py-1 text-[11px] font-bold text-white/75">{offer.courseCount} {offer.courseCount === 1 ? 'curso' : 'cursos'}</span></div><h2 className="mt-5 max-w-xl text-2xl font-black leading-tight tracking-[-0.035em] text-white sm:text-3xl">{offer.programName}</h2><div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-white/[0.1] py-5"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/45">Investimento</p><p className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">{price(offer.priceCents)}</p></div>{expiresAt && <p className="max-w-[14rem] text-sm leading-5 text-[#d9c5ee]">Oferta válida até <strong className="text-white">{expiresAt}</strong></p>}</div><p className="mt-5 max-w-xl text-sm leading-6 text-white/60">Este programa foi selecionado para você. O conteúdo será liberado após a confirmação do pagamento.</p>{checkoutError && <p className="mt-5 rounded-lg border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm font-semibold leading-6 text-rose-100" role="alert">{checkoutError}</p>}<button className="asex-gradient mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#241433]" disabled={processing} onClick={checkout} type="button">{processing ? 'Preparando checkout…' : 'Quero este programa'} <span aria-hidden className="ml-2">→</span></button></div>
    </article>;
}
