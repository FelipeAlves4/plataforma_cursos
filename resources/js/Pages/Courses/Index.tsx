import OfferCard from '@/Components/OfferCard';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

type Offer = { id: number; programName: string; priceCents: number; expiresAt?: string | null; courseCount: number };

export default function Index({ offers }: { offers: Offer[] }) {
    return (
        <StudentLayout>
            <Head title="Explorar" />

            <section className="-mx-5 -mt-24 overflow-hidden sm:-mx-8 sm:-mt-28 lg:-mx-12 xl:-mx-16">
                <div className="relative min-h-[440px] bg-[#100c18] sm:min-h-[500px]">
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(168,85,247,.32),transparent_15%),radial-gradient(ellipse_at_80%_48%,rgba(88,35,145,.34),transparent_40%),linear-gradient(90deg,#08070d_0%,rgba(8,7,13,.92)_45%,rgba(8,7,13,.56)_100%)]" />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#08070d] to-transparent" />
                    <div className="relative flex min-h-[440px] items-end px-5 pb-24 pt-32 sm:min-h-[500px] sm:px-8 sm:pb-28 lg:px-12 xl:px-16">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c28aff]">Seleção ASEX</p>
                            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">Explore sua próxima evolução.</h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg">Programas selecionados para ampliar prática, liderança e resultado.</p>
                        </div>
                    </div>
                </div>
            </section>

            {offers.length ? (
                <section className="relative -mt-10 sm:-mt-14">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b879f4]">Para você</p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">Programas disponíveis</h2>
                        </div>
                        <p className="hidden text-xs font-semibold text-white/36 sm:block">Acesso após confirmação do pagamento.</p>
                    </div>
                    <div className={offers.length === 1 ? 'max-w-4xl' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
                        {offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                    </div>
                </section>
            ) : (
                <section className="relative -mt-8 max-w-2xl border-t border-white/[0.08] py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Em breve</p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Nenhum programa disponível agora.</h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">Quando houver um programa preparado para você, ele aparecerá aqui.</p>
                    <Link className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href="/my-courses">Ir para minha lista</Link>
                </section>
            )}
        </StudentLayout>
    );
}
