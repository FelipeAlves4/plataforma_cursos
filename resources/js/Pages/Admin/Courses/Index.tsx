import ConfirmationDialog from '@/Components/ConfirmationDialog';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Course = { id: number; title: string; slug: string; status: 'DRAFT' | 'PUBLISHED'; modules_count: number; lessons_count: number; enrollments_count: number };

function Status({ status }: { status: Course['status'] }) {
    return <span className={status === 'PUBLISHED' ? 'admin-status admin-status-published' : 'admin-status admin-status-draft'}>{status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span>;
}

export default function Index({ courses }: { courses: Course[] }) {
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [deleting, setDeleting] = useState(false);

    const remove = () => {
        if (!courseToDelete) return;
        router.delete(`/admin/courses/${courseToDelete.id}`, { onStart: () => setDeleting(true), onFinish: () => setDeleting(false), onSuccess: () => setCourseToDelete(null) });
    };

    return <AdminLayout>
        <Head title="Administração de cursos" />
        <section className="admin-page-header"><div><p className="admin-eyebrow">Administração</p><h1>Cursos</h1><p>Edite o catálogo, a estrutura e as matrículas de cada curso.</p></div><Link className="admin-primary-button" href="/admin/courses/create">Novo curso</Link></section>
        <section className="admin-panel mt-8 overflow-hidden">
            {courses.length ? <>
                <div className="hidden overflow-x-auto md:block"><table className="admin-table min-w-[820px]"><thead><tr><th>Curso</th><th>Status</th><th>Módulos</th><th>Aulas</th><th>Matrículas</th><th className="text-right">Ações</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id}><td><Link className="admin-table-link" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link><small className="mt-1 block text-[#AAA0B9]">/{course.slug}</small></td><td><Status status={course.status} /></td><td>{course.modules_count}</td><td>{course.lessons_count}</td><td><Link className="admin-text-link" href={`/admin/courses/${course.id}/students`}>{course.enrollments_count}</Link></td><td><div className="flex justify-end gap-3"><Link className="admin-text-link" href={`/admin/courses/${course.id}/edit`}>Editar</Link><Link className="admin-text-link" href={`/admin/courses/${course.id}/students`}>Alunos</Link><button className="admin-danger-link" type="button" onClick={() => setCourseToDelete(course)}>Excluir</button></div></td></tr>)}</tbody></table></div>
                <div className="divide-y divide-white/10 md:hidden">{courses.map((course) => <article className="p-5" key={course.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><Link className="admin-table-link block truncate" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link><p className="mt-1 truncate text-sm text-[#AAA0B9]">/{course.slug}</p></div><Status status={course.status} /></div><dl className="mt-5 grid grid-cols-3 gap-3 text-sm"><div><dt>Módulos</dt><dd>{course.modules_count}</dd></div><div><dt>Aulas</dt><dd>{course.lessons_count}</dd></div><div><dt>Matrículas</dt><dd>{course.enrollments_count}</dd></div></dl><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2"><Link className="admin-text-link" href={`/admin/courses/${course.id}/edit`}>Editar</Link><Link className="admin-text-link" href={`/admin/courses/${course.id}/students`}>Alunos</Link><button className="admin-danger-link" type="button" onClick={() => setCourseToDelete(course)}>Excluir</button></div></article>)}</div>
            </> : <div className="admin-empty-state py-16"><p>Nenhum curso cadastrado.</p><Link className="admin-text-link" href="/admin/courses/create">Criar o primeiro curso</Link></div>}
        </section>
        <ConfirmationDialog confirmLabel="Excluir curso" description={<>Curso: <strong>{courseToDelete?.title}</strong><br />Esta ação não poderá ser desfeita.</>} onCancel={() => setCourseToDelete(null)} onConfirm={remove} open={Boolean(courseToDelete)} processing={deleting} title="Excluir curso?" />
    </AdminLayout>;
}
