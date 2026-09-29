import ConfirmationDialog from '@/Components/ConfirmationDialog';
import ProgressBar from '@/Components/ProgressBar';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type Student = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    createdAt?: string | null;
    lastActivityAt?: string | null;
    status: 'Ativo' | 'Inativo' | 'Não iniciou' | 'Sem matrícula';
    courseCount: number;
    completedCourses: number;
    averageProgress: number;
};

type StudentCourse = {
    id: number;
    title: string;
    slug: string;
    enrollmentId: number;
    enrolledAt?: string | null;
    completedLessons: number;
    lessonCount: number;
    progress: number;
    lastActivityAt?: string | null;
    status: 'Concluído' | 'Não iniciado' | 'Inativo' | 'Em andamento';
};

type AvailableCourse = { id: number; title: string };

function statusClass(status: string): string {
    return status === 'Ativo' || status === 'Concluído' || status === 'Em andamento'
        ? 'bg-emerald-400/12 text-emerald-200'
        : status === 'Não iniciou'
            ? 'bg-amber-400/12 text-amber-100'
            : status === 'Inativo'
                ? 'bg-rose-400/12 text-rose-200'
                : 'bg-white/[0.07] text-white/50';
}

function formatDate(value?: string | null, includeTime = false): string {
    if (!value) return '—';

    return new Intl.DateTimeFormat('pt-BR', includeTime
        ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' }
    ).format(new Date(value));
}

export default function Show({ student, courses, availableCourses }: { student: Student; courses: StudentCourse[]; availableCourses: AvailableCourse[] }) {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [courseToRemove, setCourseToRemove] = useState<StudentCourse | null>(null);
    const [removing, setRemoving] = useState(false);

    const initials = useMemo(
        () => student.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
        [student.name],
    );

    const enroll = (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCourseId) return;

        router.post(`/admin/courses/${selectedCourseId}/enrollments`, { user_id: student.id }, {
            preserveScroll: true,
            onStart: () => setEnrolling(true),
            onFinish: () => setEnrolling(false),
            onSuccess: () => setSelectedCourseId(''),
        });
    };

    const removeEnrollment = () => {
        if (!courseToRemove) return;

        router.delete(`/admin/courses/${courseToRemove.id}/enrollments/${courseToRemove.enrollmentId}`, {
            preserveScroll: true,
            onStart: () => setRemoving(true),
            onFinish: () => setRemoving(false),
            onSuccess: () => setCourseToRemove(null),
        });
    };

    return (
        <AdminLayout>
            <Head title={student.name} />

            <section className="admin-page-header">
                <div>
                    <p className="admin-eyebrow">Alunos / Detalhes</p>
                    <h1>{student.name}</h1>
                    <p>{student.email}</p>
                </div>
                <Link className="admin-text-link" href="/admin/students">Voltar para alunos</Link>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Cursos</p>
                    <strong className="mt-3 block text-3xl font-black text-white">{student.courseCount}</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">matrículas ativas</span>
                </article>
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Concluídos</p>
                    <strong className="mt-3 block text-3xl font-black text-emerald-300">{student.completedCourses}</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">cursos finalizados</span>
                </article>
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Progresso médio</p>
                    <strong className="mt-3 block text-3xl font-black text-white">{student.averageProgress}%</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">considerando cursos matriculados</span>
                </article>
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Status</p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${statusClass(student.status)}`}>{student.status}</span>
                    <span className="mt-2 block text-sm text-[#AAA0B9]">{student.lastActivityAt ? `Última atividade em ${formatDate(student.lastActivityAt, true)}` : 'Sem atividade em aulas'}</span>
                </article>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
                <article className="admin-panel p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#6429aa,#a855f7)] text-lg font-black text-white">{initials || 'A'}</span>
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-black text-white">{student.name}</h2>
                            <p className="mt-1 truncate text-sm text-[#AAA0B9]">{student.email}</p>
                        </div>
                    </div>
                    <dl className="mt-6 grid gap-5 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
                        <div><dt className="text-[#7F7592]">Telefone</dt><dd className="mt-1 font-semibold text-white">{student.phone || 'Não informado'}</dd></div>
                        <div><dt className="text-[#7F7592]">Empresa</dt><dd className="mt-1 font-semibold text-white">{student.company || 'Não informada'}</dd></div>
                        <div><dt className="text-[#7F7592]">Cargo ou função</dt><dd className="mt-1 font-semibold text-white">{student.jobTitle || 'Não informado'}</dd></div>
                        <div><dt className="text-[#7F7592]">Cadastro</dt><dd className="mt-1 font-semibold text-white">{formatDate(student.createdAt)}</dd></div>
                    </dl>
                </article>

                <article className="admin-panel p-5 sm:p-6">
                    <p className="admin-eyebrow">Nova matrícula</p>
                    <h2 className="mt-2 text-xl font-black text-white">Adicionar curso</h2>
                    <p className="mt-2 text-sm leading-6 text-[#AAA0B9]">Selecione um curso publicado que ainda não esteja na biblioteca deste aluno.</p>

                    <form className="mt-5 space-y-3" onSubmit={enroll}>
                        <select
                            className="w-full rounded-xl"
                            disabled={!availableCourses.length}
                            onChange={(event) => setSelectedCourseId(event.target.value)}
                            required
                            value={selectedCourseId}
                        >
                            <option value="">Selecionar curso</option>
                            {availableCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                        </select>
                        <button className="admin-primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-40" disabled={enrolling || !selectedCourseId} type="submit">
                            {enrolling ? 'Matriculando…' : 'Matricular aluno'}
                        </button>
                    </form>

                    {!availableCourses.length && <p className="mt-4 text-sm text-[#7F7592]">O aluno já está matriculado em todos os cursos publicados.</p>}
                </article>
            </section>

            <section className="admin-panel mt-6 overflow-hidden">
                <div className="admin-panel-heading">
                    <div>
                        <h2>Cursos do aluno</h2>
                        <p>{courses.length === 1 ? '1 matrícula ativa.' : `${courses.length} matrículas ativas.`}</p>
                    </div>
                </div>

                {courses.length ? (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="admin-table min-w-[980px]">
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Progresso</th>
                                        <th>Aulas</th>
                                        <th>Última atividade</th>
                                        <th>Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course.enrollmentId}>
                                            <td>
                                                <strong className="block text-white">{course.title}</strong>
                                                <small className="mt-1 block text-[#AAA0B9]">Matriculado em {formatDate(course.enrolledAt)}</small>
                                            </td>
                                            <td className="min-w-52"><ProgressBar tone="dark" value={course.progress} /></td>
                                            <td>{course.completedLessons} de {course.lessonCount}</td>
                                            <td>{course.lastActivityAt ? formatDate(course.lastActivityAt, true) : 'Sem atividade'}</td>
                                            <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(course.status)}`}>{course.status}</span></td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Link className="admin-text-link" href={`/admin/courses/${course.id}/edit`}>Abrir curso</Link>
                                                    <button className="admin-danger-link" onClick={() => setCourseToRemove(course)} type="button">Remover</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-white/10 md:hidden">
                            {courses.map((course) => (
                                <article className="p-5" key={course.enrollmentId}>
                                    <div className="flex items-start justify-between gap-4">
                                        <strong className="text-white">{course.title}</strong>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(course.status)}`}>{course.status}</span>
                                    </div>
                                    <div className="mt-5"><ProgressBar tone="dark" value={course.progress} /></div>
                                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                                        <span className="text-[#AAA0B9]">{course.completedLessons} de {course.lessonCount} aulas</span>
                                        <button className="admin-danger-link" onClick={() => setCourseToRemove(course)} type="button">Remover</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="admin-empty-state py-16">
                        <p>Este aluno ainda não possui matrículas.</p>
                    </div>
                )}
            </section>

            <ConfirmationDialog
                confirmLabel="Remover matrícula"
                description={<>Curso: <strong>{courseToRemove?.title}</strong><br />O progresso existente não será apagado, mas o aluno perderá o acesso ao curso.</>}
                onCancel={() => setCourseToRemove(null)}
                onConfirm={removeEnrollment}
                open={Boolean(courseToRemove)}
                processing={removing}
                title="Remover matrícula?"
            />
        </AdminLayout>
    );
}
