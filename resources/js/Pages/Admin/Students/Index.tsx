import ConfirmationDialog from '@/Components/ConfirmationDialog';
import ProgressBar from '@/Components/ProgressBar';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Student = { enrollmentId: number; id: number; name: string; email: string; enrolledAt?: string | null; progress: number };
type Props = { course: { id: number; title: string; slug: string }; students: Student[]; availableStudents: Array<{ id: number; name: string; email: string }> };

export default function Index({ course, students, availableStudents }: Props) {
    const form = useForm({ user_id: '' });
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const [removing, setRemoving] = useState(false);
    const submit = (event: FormEvent) => { event.preventDefault(); form.post(`/admin/courses/${course.id}/enrollments`, { preserveScroll: true, onSuccess: () => form.reset() }); };
    const remove = () => {
        if (!studentToRemove) return;
        router.delete(`/admin/courses/${course.id}/enrollments/${studentToRemove.enrollmentId}`, { preserveScroll: true, onStart: () => setRemoving(true), onFinish: () => setRemoving(false), onSuccess: () => setStudentToRemove(null) });
    };

    return <AdminLayout>
        <Head title={`Alunos — ${course.title}`} />
        <section className="admin-page-header"><div><p className="admin-eyebrow">Cursos / {course.slug} / Alunos</p><h1>{course.title}</h1><p>Gerencie somente as matrículas deste curso.</p></div><Link className="admin-text-link" href={`/admin/courses/${course.id}/edit`}>Voltar ao curso</Link></section>
        <section className="admin-panel mt-8 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-black text-[#F4F1FA]">Matricular aluno</h2><p className="mt-1 text-sm text-[#AAA0B9]">Apenas alunos ainda não vinculados a este curso aparecem aqui.</p></div></div><form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="student">Aluno</label><select className="min-w-0 flex-1 rounded-xl" id="student" value={form.data.user_id} required onChange={(event) => form.setData('user_id', event.target.value)}><option value="">Selecionar aluno</option>{availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.email}</option>)}</select><button className="admin-primary-button disabled:cursor-not-allowed disabled:opacity-40" disabled={form.processing || !availableStudents.length}>{form.processing ? 'Matriculando…' : 'Matricular aluno'}</button></form>{!availableStudents.length && <p className="mt-3 text-sm text-[#877D98]">Não há alunos disponíveis para uma nova matrícula.</p>}</section>
        <section className="admin-panel mt-6 overflow-hidden"><div className="admin-panel-heading"><div><h2>Alunos matriculados</h2><p>{students.length === 1 ? '1 matrícula neste curso.' : `${students.length} matrículas neste curso.`}</p></div></div>{students.length ? <><div className="hidden overflow-x-auto md:block"><table className="admin-table min-w-[760px]"><thead><tr><th>Aluno</th><th>Progresso</th><th>Matrícula em</th><th className="text-right">Ações</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><strong className="block text-[#F4F1FA]">{student.name}</strong><small className="mt-1 block text-[#AAA0B9]">{student.email}</small></td><td className="min-w-48"><ProgressBar tone="dark" value={student.progress} /></td><td>{student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('pt-BR') : '—'}</td><td className="text-right"><button className="admin-danger-link" type="button" onClick={() => setStudentToRemove(student)}>Remover</button></td></tr>)}</tbody></table></div><div className="divide-y divide-white/10 md:hidden">{students.map((student) => <article className="p-5" key={student.id}><strong className="block text-[#F4F1FA]">{student.name}</strong><small className="mt-1 block text-[#AAA0B9]">{student.email}</small><div className="mt-5"><ProgressBar tone="dark" value={student.progress} /></div><div className="mt-5 flex items-center justify-between gap-4 text-sm text-[#AAA0B9]"><span>{student.enrolledAt ? `Matriculado em ${new Date(student.enrolledAt).toLocaleDateString('pt-BR')}` : 'Data não informada'}</span><button className="admin-danger-link" type="button" onClick={() => setStudentToRemove(student)}>Remover</button></div></article>)}</div></> : <div className="admin-empty-state py-16"><p>Ainda não há alunos matriculados.</p></div>}</section>
        <ConfirmationDialog confirmLabel="Remover matrícula" description={<>Aluno: <strong>{studentToRemove?.name}</strong><br />Esta ação não poderá ser desfeita.</>} onCancel={() => setStudentToRemove(null)} onConfirm={remove} open={Boolean(studentToRemove)} processing={removing} title="Remover matrícula?" />
    </AdminLayout>;
}
