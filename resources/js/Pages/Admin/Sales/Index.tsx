import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Sale = {
    id: number;
    student: { name: string; email: string };
    programName: string;
    amountCents: number;
    status: string;
    createdAt: string;
    paidAt?: string | null;
};

const filters = [
    { value: 'ALL', label: 'Todas' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'PAID', label: 'Pagas' },
    { value: 'FAILED', label: 'Falharam' },
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'REFUNDED', label: 'Reembolsadas' },
];

const statusCopy: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pendente', className: 'bg-amber-400/12 text-amber-100' },
    PAID: { label: 'Paga', className: 'bg-emerald-400/12 text-emerald-200' },
    FAILED: { label: 'Falhou', className: 'bg-rose-400/12 text-rose-200' },
    CANCELLED: { label: 'Cancelada', className: 'bg-white/[0.07] text-white/50' },
    REFUNDED: { label: 'Reembolsada', className: 'bg-sky-400/12 text-sky-200' },
};

const price = (cents: number): string => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const date = (value: string): string => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
}).format(new Date(value));

export default function Index({ sales, status }: { sales: Sale[]; status: string }) {
    const currentFilter = filters.find((filter) => filter.value === status);

    return (
        <AdminLayout>
            <Head title="Vendas" />

            <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <p className="admin-eyebrow">Comercial</p>
                    <h1 className="admin-page-title">Vendas</h1>
                    <p className="admin-page-subtitle">Acompanhe pedidos e pagamentos reais da plataforma.</p>
                </div>
                <Link className="admin-primary-button" href="/admin/offers/create">Criar oferta</Link>
            </div>

            <div aria-label="Filtrar vendas" className="mt-7 flex flex-wrap gap-2">
                {filters.map((filter) => (
                    <button
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${status === filter.value ? 'border-[#c28aff] bg-[#6429aa]/35 text-white' : 'border-white/15 text-[#C9C0D4] hover:border-white/25 hover:text-white'}`}
                        key={filter.value}
                        onClick={() => router.get('/admin/sales', filter.value === 'ALL' ? {} : { status: filter.value }, { preserveState: false, replace: true })}
                        type="button"
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <section className="admin-panel mt-6 overflow-hidden">
                {sales.length ? (
                    <div className="overflow-x-auto">
                        <table className="admin-table min-w-[920px]">
                            <thead>
                                <tr>
                                    <th>Comprador</th>
                                    <th>Programa</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Pedido em</th>
                                    <th>Pagamento</th>
                                    <th className="text-right">Detalhe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => {
                                    const saleStatus = statusCopy[sale.status] ?? { label: sale.status, className: 'bg-white/[0.07] text-white/55' };

                                    return (
                                        <tr key={sale.id}>
                                            <td>
                                                <strong className="block text-[#F4F1FA]">{sale.student.name}</strong>
                                                <small className="mt-1 block text-[#AAA0B9]">{sale.student.email}</small>
                                            </td>
                                            <td>{sale.programName}</td>
                                            <td className="font-bold text-white">{price(sale.amountCents)}</td>
                                            <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${saleStatus.className}`}>{saleStatus.label}</span></td>
                                            <td>{date(sale.createdAt)}</td>
                                            <td>{sale.paidAt ? date(sale.paidAt) : '—'}</td>
                                            <td className="text-right"><Link className="admin-secondary-link" href={`/admin/sales/${sale.id}`}>Abrir</Link></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-white/45">↗</span>
                        <h2 className="mt-5 text-xl font-black text-white">{status === 'ALL' ? 'Nenhuma venda registrada ainda.' : `Nenhuma venda ${currentFilter?.label.toLowerCase() ?? ''}.`}</h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#AAA0B9]">
                            {status === 'ALL'
                                ? 'Assim que um pedido for criado, ele aparecerá aqui com status, valor e comprador.'
                                : 'Troque o filtro para visualizar outros pedidos ou crie uma nova oferta comercial.'}
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {status !== 'ALL' && <button className="admin-secondary-button" onClick={() => router.get('/admin/sales')} type="button">Ver todas</button>}
                            <Link className="admin-primary-button" href="/admin/offers/create">Criar oferta</Link>
                        </div>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
