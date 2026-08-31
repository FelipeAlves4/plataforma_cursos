import OfferCard from '@/Components/OfferCard';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

type Offer = { id: number; programName: string; priceCents: number; expiresAt?: string | null; courseCount: number };

export default function Index({ offers }: { offers: Offer[] }) {
    return <StudentLayout><Head title="Disponível para você" />
        <section className="relative overflow-hidden border-b border-white/[0.08] pb-10 sm:pb-14"><span aria-hidden className="absolute right-0 top-0 h-64 w-64 rotate-45 border border-[#9347dd]/35" /><div className="relative max-w-3xl"><p className="text-sm font-bold text-[#c28aff]">ASEX Educação</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Disponível para você</h1><p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">Programas selecionados especialmente para a sua jornada.</p></div></section>
        {offers.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div> : <section className="mt-8 max-w-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center sm:px-10"><h2 className="text-2xl font-black text-white">Nenhuma oferta disponível agora.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55 sm:text-base">Quando houver um programa preparado para você, ele aparecerá aqui.</p><Link className="asex-gradient mt-7 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d]" href="/my-courses">Ir para meus cursos</Link></section>}
    </StudentLayout>;
}
