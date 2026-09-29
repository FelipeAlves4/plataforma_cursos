import ConfirmationDialog from '@/Components/ConfirmationDialog';
import CourseCover from '@/Components/CourseCover';
import AdminLayout from '@/Layouts/AdminLayout';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Course = {
    id: number;
    title: string;
    slug: string;
    status: 'DRAFT' | 'PUBLISHED';
    category?: string | null;
    thumbnailPath?: string | null;
    modulesCount: number;
    lessonsCount: number;
    enrollmentsCount: number;
};

function Status({ status }: { status: Course['status'] }) {
    return <span className={status === 'PUBLISHED' ? 'admin-status admin-status-published' : 'admin-status admin-status-draft'}>{status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span>;
}

function Actions({ course, onDelete }: { course: Course; onDelete: () => void }) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton aria-label={`Ações do curso ${course.title}`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-lg font-black text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
                ⋯
            </MenuButton>
            <MenuItems
                anchor="bottom end"
                className="z-50 mt-2 w-48 origin-top-right rounded-xl border border-white/10 bg-[#15101f] p-1.5 text-sm shadow-[0_20px_50px_rgba(0,0,0,.45)] focus:outline-none"
            >
                <MenuItem>
                    {({ focus }) => <Link className={`block rounded-lg px-3 py-2.5 font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/72'}`} href={`/admin/courses/${course.id}/edit`}>Editar curso</Link>}
                </MenuItem>
                <MenuItem>
                    {({ focus }) => <Link className={`block rounded-lg px-3 py-2.5 font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/72'}`} href={`/admin/courses/${course.id}/students`}>Gerenciar matrículas</Link>}
                </MenuItem>
                <MenuItem>
                    {({ focus }) => <Link className={`block rounded-lg px-3 py-2.5 font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/72'}`} href={`/admin/courses/${course.id}/preview`}>Pré-visualizar</Link>}
                </MenuItem>
                <div className="my-1 border-t border-white/10" />
                <MenuItem>
                    {({ focus }) => <button className={`block w-full rounded-lg px-3 py-2.5 text-left font-semibold ${focus ? 'bg-rose-500/10 text-rose-200' : 'text-rose-300'}`} onClick={onDelete} type="button">Excluir curso</button>}
                </MenuItem>
            </MenuItems>
        </Menu>
    );
}

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

    return (
        <AdminLayout>
            <Head title="Administração de cursos" />

            <section className="admin-page-header">
                <div>
                    <p className="admin-eyebrow">Administração</p>
                    <h1>Cursos</h1>
                    <p>Edite conteúdo, estrutura e matrículas de cada curso.</p>
                </div>
                <Link className="admin-primary-button" href="/admin/courses/create">Novo curso</Link>
            </section>

            <section className="admin-panel mt-8 overflow-hidden">
                {courses.length ? (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="admin-table min-w-[920px]">
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Status</th>
                                        <th>Módulos</th>
                                        <th>Aulas</th>
                                        <th>Matrículas</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course.id}>
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#15101b]">
                                                        <CourseCover className="h-full w-full" thumbnailPath={course.thumbnailPath} title={course.title} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link className="admin-table-link block truncate" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link>
                                                        <small className="mt-1 block truncate text-[#AAA0B9]">{course.category || 'Sem categoria'} · /{course.slug}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><Status status={course.status} /></td>
                                            <td>{course.modulesCount}</td>
                                            <td>{course.lessonsCount}</td>
                                            <td><Link className="admin-text-link" href={`/admin/courses/${course.id}/students`}>{course.enrollmentsCount}</Link></td>
                                            <td className="text-right"><Actions course={course} onDelete={() => setCourseToDelete(course)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-white/10 md:hidden">
                            {courses.map((course) => (
                                <article className="p-5" key={course.id}>
                                    <div className="flex gap-4">
                                        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
                                            <CourseCover className="h-full w-full" thumbnailPath={course.thumbnailPath} title={course.title} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link className="admin-table-link block truncate" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link>
                                                    <p className="mt-1 truncate text-xs text-[#AAA0B9]">{course.category || 'Sem categoria'}</p>
                                                </div>
                                                <Actions course={course} onDelete={() => setCourseToDelete(course)} />
                                            </div>
                                            <div className="mt-3"><Status status={course.status} /></div>
                                        </div>
                                    </div>
                                    <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                                        <div><dt>Módulos</dt><dd>{course.modulesCount}</dd></div>
                                        <div><dt>Aulas</dt><dd>{course.lessonsCount}</dd></div>
                                        <div><dt>Matrículas</dt><dd>{course.enrollmentsCount}</dd></div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="admin-empty-state py-16">
                        <p>Nenhum curso cadastrado.</p>
                        <Link className="admin-text-link" href="/admin/courses/create">Criar o primeiro curso</Link>
                    </div>
                )}
            </section>

            <ConfirmationDialog
                confirmLabel="Excluir curso"
                description={<>Curso: <strong>{courseToDelete?.title}</strong><br />Esta ação não poderá ser desfeita.</>}
                onCancel={() => setCourseToDelete(null)}
                onConfirm={remove}
                open={Boolean(courseToDelete)}
                processing={deleting}
                title="Excluir curso?"
            />
        </AdminLayout>
    );
}
