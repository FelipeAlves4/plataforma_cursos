import CurrencyInput, { formatCurrency } from '@/Components/CurrencyInput';
import StudentCombobox from '@/Components/StudentCombobox';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';

type Student = { id: number; name: string; email: string };
type Program = { id: number; name: string; defaultPriceCents: number; courses: { id: number; title: string }[] };

export default function Create({ students, programs, selectedProgramId }: { students: Student[]; programs: Program[]; selectedProgramId?: number | null }) {
    const initialProgram = programs.find((program) => program.id === selectedProgramId);
    const form = useForm({ user_id: '', program_id: initialProgram ? String(initialProgram.id) : '', price_cents: initialProgram?.defaultPriceCents ?? 0, expires_at: '' });
    const selectedProgram = useMemo(() => programs.find((program) => program.id === Number(form.data.program_id)), [form.data.program_id, programs]);
    const selectedStudent = useMemo(() => students.find((student) => student.id === Number(form.data.user_id)), [form.data.user_id, students]);

    const selectProgram = (id: string): void => {
        const program = programs.find((item) => item.id === Number(id));
        form.setData((data) => ({ ...data, program_id: id, price_cents: program?.defaultPriceCents ?? 0 }));
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        form.post('/admin/offers');
    };

    const cta = selectedStudent ? `Disponibilizar para ${selectedStudent.name.split(' ')[0]}` : 'Disponibilizar para aluno';

    return <AdminLayout>
        <Head title="Disponibilizar programa" />
        <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="admin-eyebrow">Comercial</p><h1 className="admin-page-title">Disponibilizar programa</h1><p className="admin-page-subtitle">A oferta ficará visível somente para o aluno escolhido.</p></div>
            <Link className="admin-secondary-link" href="/admin/sales">Voltar para vendas</Link>
        </div>

        <form className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]" onSubmit={submit}>
            <section className="admin-panel p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2"><StudentCombobox error={form.errors.user_id} onChange={(studentId) => form.setData('user_id', studentId)} students={students} value={form.data.user_id} /></div>
                    <label className="admin-field sm:col-span-2">
                        <span>Programa</span>
                        <select onChange={(event) => selectProgram(event.target.value)} required value={form.data.program_id}>
                            <option value="">Selecionar programa</option>
                            {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                        </select>
                        {form.errors.program_id && <small>{form.errors.program_id}</small>}
                    </label>
                    <label className="admin-field">
                        <span>Preço desta oferta</span>
                        <CurrencyInput id="offer-price" onChange={(value) => form.setData('price_cents', value)} required value={form.data.price_cents} />
                        {form.errors.price_cents && <small>{form.errors.price_cents}</small>}
                    </label>
                    <label className="admin-field">
                        <span>Validade</span>
                        <input onChange={(event) => form.setData('expires_at', event.target.value)} type="datetime-local" value={form.data.expires_at} />
                        <small>Deixe em branco para não definir prazo.</small>
                        {form.errors.expires_at && <small>{form.errors.expires_at}</small>}
                    </label>
                </div>

                {selectedProgram && <section className="mt-8 border-t border-white/10 pt-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-black text-[#F8F7FB]">Cursos que serão incluídos</h2><p className="mt-1 text-sm text-[#9D93B8]">Este conjunto é salvo como um snapshot da oferta.</p></div><span className="text-sm font-bold text-[#D8B4FE]">{selectedProgram.courses.length} cursos</span></div><ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#100C18]">{selectedProgram.courses.map((course) => <li className="px-4 py-3 text-sm font-semibold text-[#C9C2D9]" key={course.id}>{course.title}</li>)}</ul></section>}

                <div className="mt-8 flex flex-wrap gap-3"><button className="admin-primary-button disabled:opacity-50" disabled={form.processing} type="submit">{form.processing ? 'Disponibilizando…' : cta}</button><Link className="admin-secondary-link self-center" href="/admin/sales">Cancelar</Link></div>
            </section>

            <aside className="admin-panel h-fit p-6 lg:sticky lg:top-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9347DD]">Prévia da oferta</p>
                <h2 className="mt-3 text-xl font-black text-[#F8F7FB]">{selectedProgram?.name || 'Programa ainda não selecionado'}</h2>
                <dl className="mt-6 space-y-4 text-sm">
                    <div><dt className="text-[#9D93B8]">Aluno</dt><dd className="mt-1 font-bold text-[#F8F7FB]">{selectedStudent?.name || 'Selecione um aluno'}{selectedStudent && <span className="mt-0.5 block text-xs font-normal text-[#9D93B8]">{selectedStudent.email}</span>}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#9D93B8]">Cursos</dt><dd className="font-bold text-[#F8F7FB]">{selectedProgram?.courses.length ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#9D93B8]">Preço</dt><dd className="font-black text-[#F8F7FB]">{formatCurrency(form.data.price_cents)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#9D93B8]">Validade</dt><dd className="text-right font-bold text-[#F8F7FB]">{form.data.expires_at ? new Date(form.data.expires_at).toLocaleString('pt-BR') : 'Sem prazo'}</dd></div>
                    <div className="flex justify-between gap-4 border-t border-white/10 pt-4"><dt className="text-[#9D93B8]">Status</dt><dd className="font-bold text-amber-200">PENDING</dd></div>
                </dl>
            </aside>
        </form>
    </AdminLayout>;
}
