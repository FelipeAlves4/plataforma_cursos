import { router } from '@inertiajs/react';
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
    const expiresAt = offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString('pt-BR') : null;

    const checkout = (): void => {
        setProcessing(true);
        router.post(`/offers/${offer.id}/checkout`, {}, { onFinish: () => setProcessing(false) });
    };

    return <article className="relative overflow-hidden rounded-2xl border border-[#b875ff]/30 bg-[linear-gradient(135deg,rgba(103,42,174,0.3),rgba(21,16,27,0.96)_58%)] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <span aria-hidden className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#b875ff]/20 blur-3xl" />
        <div className="relative"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#d7b5ff]">Selecionado para você</p><h2 className="mt-3 text-xl font-black leading-snug text-white sm:text-2xl">{offer.programName}</h2><p className="mt-3 text-sm text-white/65">{offer.courseCount} {offer.courseCount === 1 ? 'curso incluído' : 'cursos incluídos'}</p><p className="mt-5 text-3xl font-black tracking-tight text-white">{price(offer.priceCents)}</p>{expiresAt && <p className="mt-2 text-xs font-semibold text-[#d9c5ee]">Oferta válida até {expiresAt}</p>}<p className="mt-5 text-sm leading-6 text-white/60">Este programa foi selecionado para você. O conteúdo será liberado após a confirmação do pagamento.</p><button className="asex-gradient mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#241433]" disabled={processing} onClick={checkout} type="button">{processing ? 'Preparando checkout…' : 'Realizar pagamento'} <span aria-hidden className="ml-2">→</span></button></div>
    </article>;
}
