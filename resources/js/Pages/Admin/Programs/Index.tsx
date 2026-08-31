import { formatCurrency } from '@/Components/CurrencyInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

type Program = { id: number; name: string; audience?: string | null; courseCount: number; offerCount: number; checkoutLinkCount: number; defaultPriceCents: number; active: boolean };

export default function Index({ programs }: { programs: Program[] }) {
    return <AdminLayout>
        <Head title="Programas" />
        <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="admin-eyebrow">Comercial</p><h1 className="admin-page-title">Programas</h1><p className="admin-page-subtitle">Pacotes comerciais com cursos reais da plataforma.</p></div>
            <Link className="admin-primary-button" href="/admin/programs/create">Criar programa</Link>
        </div>
        <section className="admin-panel mt-8 overflow-hidden">
            {programs.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[900px]"><thead><tr><th>Nome</th><th>Público</th><th>Cursos</th><th>Preço padrão</th><th>Status</th><th className="text-right">Ações</th></tr></thead><tbody>{programs.map((program) => <tr key={program.id}><td><strong className="text-[#F8F7FB]">{program.name}</strong><small className="mt-1 block text-[#9D93B8]">{program.offerCount} {program.offerCount === 1 ? 'oferta' : 'ofertas'} · {program.checkoutLinkCount} {program.checkoutLinkCount === 1 ? 'link' : 'links'}</small></td><td>{program.audience ?? '—'}</td><td>{program.courseCount}</td><td>{formatCurrency(program.defaultPriceCents)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${program.active ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-white/55'}`}>{program.active ? 'Ativo' : 'Inativo'}</span></td><td><div className="flex justify-end gap-2"><Link className="admin-edit-button" href={`/admin/programs/${program.id}/edit`}>Editar</Link>{program.active && <><Link className="admin-secondary-button !px-3 !py-2" href={`/admin/offers/create?program_id=${program.id}`}>Disponibilizar para aluno</Link><Link className="admin-secondary-button !px-3 !py-2" href={`/admin/checkout-links?program_id=${program.id}`}>Criar link de venda</Link></>}</div></td></tr>)}</tbody></table></div> : <div className="admin-empty-state py-16"><p>Nenhum programa criado.</p><Link className="admin-secondary-link mt-4 inline-flex" href="/admin/programs/create">Criar o primeiro programa</Link></div>}
        </section>
    </AdminLayout>;
}
