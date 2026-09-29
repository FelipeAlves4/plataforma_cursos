import CourseCover from '@/Components/CourseCover';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Status = 'not_started' | 'in_progress' | 'completed';

type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnailPath?: string | null;
    lessonCount: number;
    completedLessonCount: number;
    progress: number;
    status: Status;
    certificate?: { downloadUrl?: string; issueUrl?: string } | null;
};

type Filter = 'all' | Status;

const filters: Array<{ label: string; value: Filter }> = [
    { label: 'Todos', value: 'all' },
    { label: 'Em andamento', value: 'in_progress' },
    { label: 'Concluídos', value: 'completed' },
];

const statusCopy: Record<Status, { badge: string; action: string }> = {
    not_started: { badge: 'Novo', action: 'Começar' },
    in_progress: { badge: 'Em andamento', action: 'Continuar' },
    completed: { badge: 'Concluído', action: 'Revisar' },
};

export default function MyCourses({ courses }: { courses: Course[] }) {
    const [activeFilter, setActiveFilter] = useState<Filter>('all');

    const visibleCourses = useMemo(
        () => activeFilter === 'all' ? courses : courses.filter((course) => course.status === activeFilter),
        [activeFilter, courses],
    );

    return (
        <StudentLayout>
            <Head title="Minha lista" />

            <section className="border-b border-white/[0.07] pb-8 sm:pb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b879f4]">Sua biblioteca</p>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Minha lista</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
                            Continue de onde parou ou escolha o próximo conteúdo.
                        </p>
                    </div>
                    {courses.length > 0 && <p className="text-sm font-semibold text-white/38">{courses.length} {courses.length === 1 ? 'curso' : 'cursos'}</p>}
                </div>
            </section>

            {courses.length > 0 ? (
                <>
                    <div aria-label="Filtrar meus cursos" className="student-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="group">
                        {filters.map((filter) => (
                            <button
                                aria-pressed={activeFilter === filter.value}
                                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] ${activeFilter === filter.value ? 'bg-white text-[#0a0810]' : 'bg-white/[0.06] text-white/58 hover:bg-white/[0.1] hover:text-white'}`}
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
                                type="button"
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {visibleCourses.length ? (
                        <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {visibleCourses.map((course) => (
                                <article className="group min-w-0" key={course.id}>
                                    <Link
                                        aria-label={`Abrir curso ${course.title}`}
                                        className="relative block aspect-video overflow-hidden rounded-lg bg-[#15111a] shadow-[0_14px_34px_rgba(0,0,0,.28)] transition duration-300 hover:z-10 hover:shadow-[0_24px_54px_rgba(0,0,0,.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] motion-safe:hover:-translate-y-1"
                                        href={`/courses/${course.slug}`}
                                    >
                                        <CourseCover className="transition duration-700 motion-safe:group-hover:scale-[1.05]" thumbnailPath={course.thumbnailPath} title={course.title} />
                                        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070d]/88 via-transparent to-transparent" />
                                        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black backdrop-blur ${course.status === 'completed' ? 'bg-emerald-400/18 text-emerald-100' : course.status === 'in_progress' ? 'bg-[#6429aa]/80 text-white' : 'bg-black/45 text-white/80'}`}>
                                            {statusCopy[course.status].badge}
                                        </span>
                                        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs text-[#08070d] opacity-0 shadow-lg transition group-hover:opacity-100">▶</div>
                                        {course.progress > 0 && (
                                            <div aria-label={`${course.progress}% concluído`} className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                                                <div className="h-full bg-[#a855f7]" style={{ width: `${course.progress}%` }} />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="pt-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-base font-black text-white">{course.title}</h2>
                                                <p className="mt-1 text-xs font-semibold text-white/42">
                                                    {course.completedLessonCount} de {course.lessonCount} aulas
                                                    {course.progress > 0 && course.progress < 100 ? ` · ${course.progress}%` : ''}
                                                </p>
                                            </div>
                                            <Link className="shrink-0 text-xs font-black text-[#c28aff] transition hover:text-white" href={`/courses/${course.slug}`}>
                                                {statusCopy[course.status].action}
                                            </Link>
                                        </div>
                                        {course.certificate && <p className="mt-2 text-xs font-bold text-[#d5b0ff]">Certificado {course.certificate.downloadUrl ? 'emitido' : 'disponível'}</p>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 border-t border-white/[0.08] py-16 text-center">
                            <h2 className="text-xl font-black text-white">Nenhum curso encontrado</h2>
                            <p className="mt-2 text-sm leading-6 text-white/48">Troque o filtro para ver outros conteúdos da sua biblioteca.</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="mt-12 max-w-2xl border-t border-white/[0.08] py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Seu acervo começa aqui</p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Você ainda não começou nenhum curso.</h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">Explore os conteúdos disponíveis e escolha seu próximo passo.</p>
                    <Link className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href="/courses">
                        Explorar conteúdos
                    </Link>
                </div>
            )}
        </StudentLayout>
    );
}
