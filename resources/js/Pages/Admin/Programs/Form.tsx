import CoursePicker from '@/Components/CoursePicker';
import CurrencyInput, { formatCurrency } from '@/Components/CurrencyInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Course = { id: number; title: string; category?: string | null };
type Program = { id: number; name: string; description?: string | null; audience?: string | null; defaultPriceCents: number; active: boolean; courseIds: number[] };

export default function Form({ courses, program }: { courses: Course[]; program?: Program }) {
    const form = useForm({
        name: program?.name ?? '',
        description: program?.description ?? '',
        audience: program?.audience ?? '',
        default_price_cents: program?.defaultPriceCents ?? 0,
        active: program?.active ?? true,
        course_ids: program?.courseIds ?? [] as number[],
        redirect_to_offer: false,
    });

    const submit = (event: FormEvent, redirectToOffer = false): void => {
        event.preventDefault();
        form.transform((data) => ({ ...data, redirect_to_offer: redirectToOffer }));

        if (program) {
            form.put(`/admin/programs/${program.id}`);

            return;
        }

        form.post('/admin/programs');
    };

    const toggleCourse = (courseId: number): void => form.setData('course_ids', form.data.course_ids.includes(courseId) ? form.data.course_ids.filter((id) => id !== courseId) : [...form.data.course_ids, courseId]);
    const selectedCourses = courses.filter((course) => form.data.course_ids.includes(course.id));

    return <AdminLayout>
        <Head title={program ? 'Editar programa' : 'Novo programa'} />
        <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
                <p className="admin-eyebrow">Comercial</p>
                <h1 className="admin-page-title">{program ? 'Editar programa' : 'Novo programa'}</h1>
                <p className="admin-page-subtitle">Defina o conteúdo e o valor padrão antes de disponibilizá-lo.</p>
            </div>
            <Link className="admin-secondary-link" href="/admin/programs">Voltar</Link>
        </div>

        <form className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]" onSubmit={(event) => submit(event)}>
            <section className="admin-panel p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="admin-field sm:col-span-2">
                        <span>Nome do programa</span>
                        <input onChange={(event) => form.setData('name', event.target.value)} required value={form.data.name} />
                        {form.errors.name && <small>{form.errors.name}</small>}
                    </label>
                    <label className="admin-field">
                        <span>Público / segmento</span>
                        <input onChange={(event) => form.setData('audience', event.target.value)} placeholder="Ex.: donos de restaurantes" value={form.data.audience} />
                        {form.errors.audience && <small>{form.errors.audience}</small>}
                    </label>
                    <label className="admin-field">
                        <span>Preço padrão</span>
                        <CurrencyInput id="program-price" onChange={(value) => form.setData('default_price_cents', value)} required value={form.data.default_price_cents} />
                        <small>Valor que será sugerido ao disponibilizar.</small>
                        {form.errors.default_price_cents && <small>{form.errors.default_price_cents}</small>}
                    </label>
                    <label className="admin-field sm:col-span-2">
                        <span>Descrição</span>
                        <textarea onChange={(event) => form.setData('description', event.target.value)} placeholder="Explique a proposta deste programa." rows={5} value={form.data.description} />
                        {form.errors.description && <small>{form.errors.description}</small>}
                    </label>
                </div>

                <CoursePicker courses={courses} error={form.errors.course_ids} onToggle={toggleCourse} selectedCourseIds={form.data.course_ids} />

                <label className="mt-7 flex cursor-pointer items-center gap-3 text-sm font-bold text-[#F8F7FB]">
                    <input checked={form.data.active} className="h-4 w-4 rounded border-white/30 bg-transparent text-[#9347DD] focus:ring-[#9347DD]" onChange={(event) => form.setData('active', event.target.checked)} type="checkbox" />
                    Programa ativo
                </label>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button className="admin-primary-button disabled:opacity-50" disabled={form.processing} type="submit">{form.processing ? 'Salvando…' : 'Salvar programa'}</button>
                    {!program && <button className="admin-secondary-button disabled:opacity-50" disabled={form.processing} onClick={(event) => submit(event, true)} type="button">Salvar e disponibilizar para aluno</button>}
                    <Link className="admin-secondary-link self-center" href="/admin/programs">Cancelar</Link>
                </div>
            </section>

            <aside className="admin-panel h-fit p-6 lg:sticky lg:top-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9347DD]">Resumo em tempo real</p>
                <h2 className="mt-3 text-xl font-black text-[#F8F7FB]">{form.data.name || 'Novo programa'}</h2>
                <dl className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4"><dt className="text-[#9D93B8]">Público</dt><dd className="text-right font-bold text-[#F8F7FB]">{form.data.audience || 'Não definido'}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-[#9D93B8]">Preço</dt><dd className="font-black text-[#F8F7FB]">{formatCurrency(form.data.default_price_cents)}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-[#9D93B8]">Cursos</dt><dd className="font-bold text-[#F8F7FB]">{selectedCourses.length}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-[#9D93B8]">Status</dt><dd className={form.data.active ? 'font-bold text-emerald-300' : 'font-bold text-[#9D93B8]'}>{form.data.active ? 'Ativo' : 'Inativo'}</dd></div>
                </dl>
                {selectedCourses.length > 0 && <div className="mt-7 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9D93B8]">Inclui</p><ul className="mt-3 space-y-2 text-sm text-[#C9C2D9]">{selectedCourses.slice(0, 4).map((course) => <li className="truncate" key={course.id}>{course.title}</li>)}{selectedCourses.length > 4 && <li className="text-[#9D93B8]">+ {selectedCourses.length - 4} cursos</li>}</ul></div>}
            </aside>
        </form>
    </AdminLayout>;
}
