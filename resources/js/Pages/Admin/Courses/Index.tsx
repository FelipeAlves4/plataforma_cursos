import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmationDialog from '@/Components/ConfirmationDialog';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Course = { id: number; title: string; slug: string; status: 'DRAFT' | 'PUBLISHED'; modules_count: number; lessons_count: number; enrollments_count: number };

export default function Index({ courses }: { courses: Course[] }) {
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState(false);

    const remove = () => {
        if (!courseToDelete) return;

        router.delete(`/admin/courses/${courseToDelete.id}`, {
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => setCourseToDelete(null),
        });
    };

    return <AdminLayout><Head title="Administração de cursos" /><div className="flex items-end justify-between gap-4"><div><p className="eyebrow text-brand-700">Administração</p><h1 className="mt-2 text-3xl font-black">Cursos</h1></div><Link className="asex-gradient rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm" href="/admin/courses/create">Novo curso</Link></div><div className="mt-8 overflow-hidden rounded-2xl border border-asex-border bg-white"><div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-6 border-b border-asex-border px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink/55 md:grid"><span>Curso</span><span>Módulos</span><span>Aulas</span><span>Alunos</span><span>Ações</span></div>{courses.map((course) => <div key={course.id} className="grid gap-3 border-b border-asex-border px-6 py-5 last:border-0 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-6"><div><p className="font-bold text-ink">{course.title}</p><p className="mt-1 text-sm text-ink/60">{course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'} · /{course.slug}</p></div><span className="text-sm text-ink/65">{course.modules_count}</span><span className="text-sm text-ink/65">{course.lessons_count}</span><Link className="text-sm font-semibold text-brand-700 hover:text-brand-900" href={`/admin/courses/${course.id}/students`}>{course.enrollments_count} alunos</Link><div className="flex gap-3 text-sm font-semibold"><Link className="text-brand-700 hover:text-brand-900" href={`/admin/courses/${course.id}/edit`}>Editar</Link><button className="text-rose-700 hover:text-rose-900" type="button" onClick={() => setCourseToDelete(course)}>Excluir</button></div></div>)}{!courses.length && <p className="p-8 text-center text-ink/60">Nenhum curso cadastrado.</p>}</div><ConfirmationDialog confirmLabel="Excluir curso" description={<>Curso: <strong>{courseToDelete?.title}</strong><br />Esta ação não poderá ser desfeita.</>} onCancel={() => setCourseToDelete(null)} onConfirm={remove} open={Boolean(courseToDelete)} processing={deleting} title="Excluir curso?" /></AdminLayout>;
}
