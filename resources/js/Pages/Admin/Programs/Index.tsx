import { formatCurrency } from '@/Components/CurrencyInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

type Program = {
    id: number;
    name: string;
    audience?: string | null;
    courseCount: number;
    offerCount: number;
    checkoutLinkCount: number;
    defaultPriceCents: number;
    active: boolean;
};

export default function Index({ programs }: { programs: Program[] }) {
    return (
        <AdminLayout>
            <Head title="Programas" />

            <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="admin-eyebrow">Comercial</p>
                    <h1 className="admin-page-title">Programas</h1>
                    <p className="admin-page-subtitle">Monte produtos comerciais combinando um ou mais cursos da plataforma.</p>
                </div>
                <Link className="admin-primary-button" href="/admin/programs/create">Criar programa</Link>
            </div>

            <section className="admin-panel mt-8 overflow-hidden">
                {programs.length ? (
                    <div className="overflow-x-auto">
                        <table className="admin-table min-w-[900px]">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Público</th>
                                    <th>Cursos</th>
                                    <th>Preço padrão</th>
                                    <th>Status</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {programs.map((program) => (
                                    <tr key={program.id}>
                                        <td>
                                            <strong className="text-[#F8F7FB]">{program.name}</strong>
                                            <small className="mt-1 block text-[#9D93B8]">
                                                {program.offerCount} {program.offerCount === 1 ? 'oferta' : 'ofertas'} · {program.checkoutLinkCount} {program.checkoutLinkCount === 1 ? 'link' : 'links'}
                                            </small>
                                        </td>
                                        <td>{program.audience ?? '—'}</td>
                                        <td>{program.courseCount}</td>
                                        <td>{formatCurrency(program.defaultPriceCents)}</td>
                                        <td>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${program.active ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-white/55'}`}>
                                                {program.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <Link className="admin-edit-button" href={`/admin/programs/${program.id}/edit`}>Editar</Link>
                                                {program.checkoutLinkCount > 0 && <Link className="admin-secondary-button !px-3 !py-2" href={`/admin/checkout-links?program_id=${program.id}`}>Ver links ({program.checkoutLinkCount})</Link>}
                                                {program.active && (
                                                    <>
                                                        <Link className="admin-secondary-button !px-3 !py-2" href={`/admin/offers/create?program_id=${program.id}`}>Disponibilizar para aluno</Link>
                                                        <Link className="admin-secondary-button !px-3 !py-2" href={`/admin/checkout-links?program_id=${program.id}&create=1`}>Criar link de venda</Link>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 sm:px-10 sm:py-14">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[#a855f7]/25 bg-[#6429aa]/15 text-xl text-[#d5b0ff]">▣</span>
                            <p className="admin-eyebrow mt-5">Seu primeiro produto comercial</p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">Crie um programa para agrupar seus cursos.</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#AAA0B9] sm:text-base">
                                Um programa é o pacote que você comercializa. Ele pode reunir um ou mais cursos e depois receber ofertas ou links de checkout.
                            </p>
                            <Link className="admin-primary-button mt-6 inline-flex" href="/admin/programs/create">Criar primeiro programa</Link>
                        </div>

                        <div className="mx-auto mt-10 grid max-w-4xl gap-3 border-t border-white/10 pt-8 sm:grid-cols-3">
                            <article className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-left">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c28aff]">Curso</p>
                                <p className="mt-2 text-sm leading-6 text-[#C7BDD5]">Conteúdo que o aluno assiste e conclui.</p>
                            </article>
                            <article className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-left">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c28aff]">Programa</p>
                                <p className="mt-2 text-sm leading-6 text-[#C7BDD5]">Pacote comercial com um ou mais cursos.</p>
                            </article>
                            <article className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-left">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c28aff]">Oferta</p>
                                <p className="mt-2 text-sm leading-6 text-[#C7BDD5]">Condição de venda aplicada ao programa.</p>
                            </article>
                        </div>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
