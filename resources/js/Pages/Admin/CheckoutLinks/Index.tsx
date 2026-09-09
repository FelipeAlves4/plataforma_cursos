import CurrencyInput, { formatCurrency } from '@/Components/CurrencyInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type Program = { id: number; name: string; defaultPriceCents: number; courseCount: number };
type LinkStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
type CheckoutLink = { id: number; name: string; programId: number; programName: string; url: string; priceCents: number; active: boolean; status: LinkStatus; expiresAt?: string | null; salesCount: number; revenueCents: number };
type Summary = { activeLinks: number; confirmedSales: number; revenueCents: number };

function Icon({ name }: { name: 'copy' | 'external' | 'plus' | 'search' | 'close' | 'link' | 'receipt' | 'revenue' }): ReactNode {
    const paths = {
        copy: <><rect height="13" rx="2" width="13" x="8" y="8" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
        external: <><path d="M14 3h7v7" /><path d="m21 3-9 9" /><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
        plus: <path d="M12 5v14M5 12h14" />,
        search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>,
        close: <path d="m6 6 12 12M18 6 6 18" />,
        link: <><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" /></>,
        receipt: <><path d="M4 3v18l2.5-1.5L9 21l3-1.5 3 1.5 2.5-1.5L20 21V3l-2.5 1.5L15 3l-3 1.5 3 1.5L9 3 6.5 4.5 4 3Z" /><path d="M8 9h8M8 13h6" /></>,
        revenue: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.55-.5-1.63-.9-3-.9-1.66 0-3 1-3 2.4 0 3.1 6 1.6 6 4.3 0 1.2-1.15 2.1-3 2.1-1.45 0-2.62-.47-3.35-1.15M12 6v12" /></>,
    };

    return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function statusLabel(status: LinkStatus): string { return { ACTIVE: 'Ativo', INACTIVE: 'Inativo', EXPIRED: 'Expirado' }[status]; }
function statusClass(status: LinkStatus): string { return { ACTIVE: 'bg-emerald-400/10 text-emerald-300', INACTIVE: 'bg-white/[0.07] text-[#B7AFC5]', EXPIRED: 'bg-rose-400/10 text-rose-300' }[status]; }
function formatDate(value?: string | null): string { return value ? new Date(value).toLocaleDateString('pt-BR') : 'Sem expiração'; }

function Metric({ icon, label, value }: { icon: 'link' | 'receipt' | 'revenue'; label: string; value: string | number }) {
    return <article className="admin-metric-card flex min-h-[132px] items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#6429AA]/20 text-[#D8B4FE]"><Icon name={icon} /></span><div><p>{label}</p><strong className="!mt-3 !text-3xl">{value}</strong></div></article>;
}

export default function Index({ programs, links, selectedProgramId, shouldOpenCreate = false, summary }: { programs: Program[]; links: CheckoutLink[]; selectedProgramId?: number | null; shouldOpenCreate?: boolean; summary: Summary }) {
    const preferredProgram = programs.find((program) => program.id === selectedProgramId) ?? programs[0];
    const form = useForm({ name: '', program_id: preferredProgram?.id ?? 0, price_cents: preferredProgram?.defaultPriceCents ?? 0, expires_at: '' });
    const [creatorOpen, setCreatorOpen] = useState(shouldOpenCreate);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | LinkStatus>('ALL');
    const [toast, setToast] = useState<string | null>(null);
    const selectedProgram = programs.find((program) => program.id === form.data.program_id);
    const programFilterName = programs.find((program) => program.id === selectedProgramId)?.name;

    useEffect(() => {
        if (selectedProgramId) {
            const program = programs.find((item) => item.id === selectedProgramId);

            if (program) {
                form.setData('program_id', program.id);
                form.setData('price_cents', program.defaultPriceCents);
            }
        }

        if (shouldOpenCreate) {
            setCreatorOpen(true);
        }
    }, [selectedProgramId, shouldOpenCreate]);

    const filteredLinks = useMemo(() => links.filter((link) => {
        const query = search.trim().toLocaleLowerCase('pt-BR');
        const matchesSearch = query === '' || link.name.toLocaleLowerCase('pt-BR').includes(query) || link.programName.toLocaleLowerCase('pt-BR').includes(query);
        const matchesProgram = !selectedProgramId || link.programId === selectedProgramId;
        const matchesStatus = filter === 'ALL' || link.status === filter;

        return matchesSearch && matchesProgram && matchesStatus;
    }), [filter, links, search, selectedProgramId]);

    const dismissCreator = (): void => { if (!form.processing) { setCreatorOpen(false); form.clearErrors(); } };
    const selectProgram = (programId: number): void => {
        const program = programs.find((item) => item.id === programId);
        form.setData('program_id', programId);
        form.setData('price_cents', program?.defaultPriceCents ?? form.data.price_cents);
    };
    const create = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        form.post('/admin/checkout-links', { onSuccess: () => { setCreatorOpen(false); form.reset('name', 'expires_at'); } });
    };
    const copy = async (url: string): Promise<void> => {
        await navigator.clipboard.writeText(url);
        setToast('Link copiado');
        window.setTimeout(() => setToast(null), 2400);
    };
    const duplicate = (link: CheckoutLink): void => router.post(`/admin/checkout-links/${link.id}/duplicate`);
    const toggleActive = (link: CheckoutLink): void => router.patch(`/admin/checkout-links/${link.id}`, { active: !link.active });

    return <AdminLayout>
        <Head title="Links de venda" />
        <section className="admin-page-header checkout-links-header"><div><h1>Links de venda</h1><p>Crie, compartilhe e acompanhe seus checkouts públicos.</p></div><button className="admin-primary-button checkout-links-primary gap-2" onClick={() => setCreatorOpen(true)} type="button"><Icon name="plus" />Novo link de venda</button></section>
        <section className="mt-7 grid gap-4 sm:grid-cols-3"><Metric icon="link" label="Links ativos" value={summary.activeLinks} /><Metric icon="receipt" label="Vendas confirmadas" value={summary.confirmedSales} /><Metric icon="revenue" label="Receita através dos links" value={formatCurrency(summary.revenueCents)} /></section>
        <section className="admin-panel mt-7 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Status dos links">{([['ALL', 'Todos'], ['ACTIVE', 'Ativos'], ['INACTIVE', 'Inativos'], ['EXPIRED', 'Expirados']] as const).map(([value, label]) => <button aria-selected={filter === value} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition ${filter === value ? 'bg-[#6429AA] text-white shadow-[0_6px_18px_rgba(100,41,170,.25)]' : 'text-[#9D93B8] hover:bg-white/[0.05] hover:text-[#F8F7FB]'}`} key={value} onClick={() => setFilter(value)} role="tab" type="button">{label}</button>)}</div><label className="relative block w-full lg:max-w-sm"><span className="sr-only">Buscar links</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9D93B8]"><Icon name="search" /></span><input className="admin-input w-full !rounded-lg py-2.5 pl-10 pr-4 text-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou programa" value={search} /></label></div>
            {selectedProgramId && <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.015] px-5 py-3 text-sm"><p className="text-[#C9C2D9]">Mostrando links de <strong className="text-[#F8F7FB]">{programFilterName ?? 'programa selecionado'}</strong></p><Link className="admin-text-link shrink-0" href="/admin/checkout-links">Ver todos</Link></div>}
            {filteredLinks.length ? <><div className="hidden overflow-x-auto md:block"><table className="admin-table min-w-[1160px]"><thead><tr><th>Link</th><th>Programa</th><th>Preço</th><th>Status</th><th>Vendas</th><th>Receita</th><th>Expiração</th><th className="text-right">Ações</th></tr></thead><tbody>{filteredLinks.map((link) => <tr key={link.id}><td className="max-w-[250px]"><Link className="admin-table-link block truncate" href={`/admin/checkout-links/${link.id}`}>{link.name}</Link><span className="mt-1 block truncate text-xs text-[#9D93B8]">{link.url}</span></td><td>{link.programName}</td><td className="font-semibold text-[#F8F7FB]">{formatCurrency(link.priceCents)}</td><td><span className={`admin-status ${statusClass(link.status)}`}>{statusLabel(link.status)}</span></td><td>{link.salesCount}</td><td className="font-semibold text-[#F8F7FB]">{formatCurrency(link.revenueCents)}</td><td>{formatDate(link.expiresAt)}</td><td><div className="flex justify-end gap-1"><button aria-label="Copiar link" className="admin-icon-button !h-8 !w-8" onClick={() => void copy(link.url)} title="Copiar link" type="button"><Icon name="copy" /></button><a aria-label="Abrir checkout" className="admin-icon-button !h-8 !w-8" href={link.url} rel="noreferrer" target="_blank" title="Abrir checkout"><Icon name="external" /></a><button aria-label="Duplicar link" className="admin-icon-button !h-8 !w-8" onClick={() => duplicate(link)} title="Duplicar" type="button"><Icon name="copy" /></button>{link.status !== 'EXPIRED' && <button className="admin-secondary-link !px-2 !py-1.5" onClick={() => toggleActive(link)} type="button">{link.active ? 'Desativar' : 'Reativar'}</button>}<Link className="admin-secondary-link !px-2 !py-1.5" href={`/admin/checkout-links/${link.id}`}>Ver detalhes</Link></div></td></tr>)}</tbody></table></div><div className="divide-y divide-white/10 md:hidden">{filteredLinks.map((link) => <article className="p-5" key={link.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><Link className="admin-table-link block truncate" href={`/admin/checkout-links/${link.id}`}>{link.name}</Link><p className="mt-1 truncate text-xs text-[#9D93B8]">{link.url}</p></div><span className={`admin-status shrink-0 ${statusClass(link.status)}`}>{statusLabel(link.status)}</span></div><p className="mt-4 text-sm text-[#C9C2D9]">{link.programName} · <strong className="text-[#F8F7FB]">{formatCurrency(link.priceCents)}</strong></p><dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm"><div><dt className="text-xs text-[#9D93B8]">Vendas</dt><dd className="mt-1 font-bold text-[#F8F7FB]">{link.salesCount}</dd></div><div><dt className="text-xs text-[#9D93B8]">Receita</dt><dd className="mt-1 font-bold text-[#F8F7FB]">{formatCurrency(link.revenueCents)}</dd></div><div className="col-span-2"><dt className="text-xs text-[#9D93B8]">Expiração</dt><dd className="mt-1 font-bold text-[#F8F7FB]">{link.expiresAt ? formatDate(link.expiresAt) : '—'}</dd></div></dl><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2"><button className="admin-text-link" onClick={() => void copy(link.url)} type="button">Copiar link</button><a className="admin-text-link" href={link.url} rel="noreferrer" target="_blank">Abrir checkout</a><button className="admin-text-link" onClick={() => duplicate(link)} type="button">Duplicar</button>{link.status !== 'EXPIRED' && <button className="admin-text-link" onClick={() => toggleActive(link)} type="button">{link.active ? 'Desativar' : 'Reativar'}</button>}<Link className="admin-text-link" href={`/admin/checkout-links/${link.id}`}>Ver detalhes</Link></div></article>)}</div></> : <div className="admin-empty-state py-16"><p>{links.length ? 'Nenhum link corresponde aos filtros.' : 'Nenhum link de venda criado.'}</p>{links.length === 0 && <button className="admin-secondary-link" onClick={() => setCreatorOpen(true)} type="button">Criar o primeiro link</button>}</div>}
        </section>
        {creatorOpen && <div aria-label="Criar link de venda" aria-modal="true" className="fixed inset-0 z-50" role="dialog"><button aria-label="Fechar criação de link" className="absolute inset-0 bg-[#08060D]/80 backdrop-blur-sm" onClick={dismissCreator} type="button" /><aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#14101F] shadow-2xl"><header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7"><h2 className="text-xl font-black text-[#F8F7FB]">Novo link de venda</h2><button aria-label="Fechar" className="admin-icon-button" onClick={dismissCreator} type="button"><Icon name="close" /></button></header><form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={create}><div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"><div className="space-y-5"><label className="admin-field"><span>Nome do link</span><input onChange={(event) => form.setData('name', event.target.value)} placeholder="Ex.: Campanha Setembro" value={form.data.name} /><small>Uso interno. Se ficar vazio, será usado o nome do programa.</small>{form.errors.name && <small className="!text-rose-300">{form.errors.name}</small>}</label><label className="admin-field"><span>Programa</span><select onChange={(event) => selectProgram(Number(event.target.value))} value={form.data.program_id}>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select>{form.errors.program_id && <small className="!text-rose-300">{form.errors.program_id}</small>}</label><label className="admin-field"><span>Preço</span><CurrencyInput id="checkout-link-price" onChange={(value) => form.setData('price_cents', value)} required value={form.data.price_cents} />{form.errors.price_cents && <small className="!text-rose-300">{form.errors.price_cents}</small>}</label><label className="admin-field"><span>Expiração</span><input min={new Date().toISOString().slice(0, 16)} onChange={(event) => form.setData('expires_at', event.target.value)} type="datetime-local" value={form.data.expires_at} />{form.errors.expires_at && <small className="!text-rose-300">{form.errors.expires_at}</small>}</label></div><section className="mt-8 rounded-xl border border-white/10 bg-[#100C18] p-5"><h3 className="text-sm font-black text-[#F8F7FB]">Resumo</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex items-center justify-between gap-5"><dt className="text-[#9D93B8]">Programa</dt><dd className="text-right font-bold text-[#F8F7FB]">{selectedProgram?.name ?? 'Selecione um programa'}</dd></div><div className="flex items-center justify-between gap-5"><dt className="text-[#9D93B8]">Quantidade de cursos</dt><dd className="font-bold text-[#F8F7FB]">{selectedProgram?.courseCount ?? 0}</dd></div><div className="flex items-center justify-between gap-5"><dt className="text-[#9D93B8]">Preço</dt><dd className="font-black text-[#F8F7FB]">{formatCurrency(form.data.price_cents)}</dd></div><div className="flex items-center justify-between gap-5"><dt className="text-[#9D93B8]">Expiração</dt><dd className="font-bold text-[#F8F7FB]">{form.data.expires_at ? formatDate(form.data.expires_at) : 'Sem expiração'}</dd></div></dl></section></div><footer className="border-t border-white/10 px-5 py-5 sm:px-7"><button className="admin-primary-button checkout-links-primary w-full gap-2" disabled={form.processing || programs.length === 0} type="submit"><Icon name="link" />{form.processing ? 'Criando…' : 'Criar link'}</button></footer></form></aside></div>}
        {toast && <div aria-live="polite" className="fixed bottom-5 right-5 z-[60] rounded-xl border border-white/10 bg-[#1A1527] px-4 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>}
    </AdminLayout>;
}
