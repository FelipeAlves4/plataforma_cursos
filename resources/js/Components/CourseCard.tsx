import { Link } from '@inertiajs/react';
import CourseCover from './CourseCover';
import ProgressBar from './ProgressBar';

type Course = {
    title: string;
    slug: string;
    description?: string | null;
    thumbnailPath?: string | null;
    category?: string | null;
    level?: string | null;
    progress: number;
    lessonCount: number;
    moduleCount?: number;
    durationMinutes?: number | null;
    enrolled?: boolean;
    status?: string;
};

type Props = { course: Course; detail?: string; variant?: 'standard' | 'poster' | 'rail' };

const catalogState: Record<string, string> = {
    available: 'Disponível',
    not_started: 'Matriculado',
    in_progress: 'Em andamento',
    completed: 'Concluído',
};

export default function CourseCard({ course, detail, variant = 'standard' }: Props) {
    if (variant === 'poster') {
        return (
            <article className="group relative min-w-[168px] overflow-hidden rounded-lg bg-[#15111a] shadow-2xl shadow-black/20 transition duration-300 motion-safe:hover:-translate-y-1 sm:min-w-[190px]">
                <Link aria-label={`Abrir curso ${course.title}`} className="block aspect-[2/3] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c28aff]" href={`/courses/${course.slug}`}>
                    <CourseCover className="transition duration-500 motion-safe:group-hover:scale-[1.05]" thumbnailPath={course.thumbnailPath} title={course.title} />
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#08070d] via-[#08070d]/68 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                        {course.status && <span className="inline-flex rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white/85">{catalogState[course.status] ?? course.status}</span>}
                        {(course.category || course.level) && <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c28aff]">{[course.category, course.level].filter(Boolean).join(' · ')}</p>}
                        <h3 className="mt-1 text-base font-black leading-tight text-white">{course.title}</h3>
                    </div>
                </Link>
            </article>
        );
    }

    if (variant === 'rail') {
        const hasProgress = course.enrolled !== false && course.progress > 0;

        return (
            <Link
                aria-label={`Abrir curso ${course.title}`}
                className="group relative block min-w-[260px] overflow-hidden rounded-lg bg-[#15111a] shadow-[0_14px_34px_rgba(0,0,0,.28)] transition duration-300 hover:z-10 hover:shadow-[0_24px_56px_rgba(0,0,0,.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.025] sm:min-w-[310px] lg:min-w-[330px]"
                href={`/courses/${course.slug}`}
            >
                <div className="relative aspect-video overflow-hidden">
                    <CourseCover className="transition duration-700 motion-safe:group-hover:scale-[1.06]" thumbnailPath={course.thumbnailPath} title={course.title} />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070d]/95 via-[#08070d]/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs text-[#08070d] shadow-lg">▶</span>
                            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/35 text-lg font-light text-white backdrop-blur">+</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d0a5ff]">
                            {[course.category, course.level].filter(Boolean).join(' · ') || `${course.lessonCount} aulas`}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight tracking-[-0.02em] text-white">{course.title}</h3>
                        <p className="mt-2 text-[11px] font-semibold text-white/48">{course.lessonCount} aulas{course.progress === 100 ? ' · Concluído' : course.progress > 0 ? ` · ${course.progress}%` : ''}</p>
                    </div>
                    {hasProgress && (
                        <div aria-label={`${course.progress}% concluído`} className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                            <div className="h-full bg-[#a855f7]" style={{ width: `${course.progress}%` }} />
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <article className="group overflow-hidden rounded-2xl border border-asex-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
            <div className="aspect-video overflow-hidden">
                <CourseCover className="transition duration-500 group-hover:scale-[1.03]" thumbnailPath={course.thumbnailPath} title={course.title} />
            </div>
            <div className="flex min-h-72 flex-col p-5 sm:p-6">
                <div>
                    <p className="text-sm font-semibold text-brand-700">{detail || [course.category, course.level].filter(Boolean).join(' · ') || `${course.lessonCount} aulas`}</p>
                    <h2 className="mt-2 text-xl font-black leading-snug text-ink">{course.title}</h2>
                    {course.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{course.description}</p>}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-ink/50">
                    <span>{course.lessonCount} aulas</span>
                    {course.moduleCount ? <span>{course.moduleCount} módulos</span> : null}
                    {course.durationMinutes ? <span>{course.durationMinutes} min</span> : null}
                </div>
                <div className="mt-auto pt-5">
                    {course.enrolled !== false && (
                        <>
                            <ProgressBar value={course.progress} />
                            <p className={`mt-3 text-xs font-bold ${course.progress === 100 ? 'text-asex-success' : 'text-ink/55'}`}>
                                {course.progress === 100 ? '✓ Curso concluído' : course.progress > 0 ? `${course.progress}% concluído` : 'Pronto para começar'}
                            </p>
                        </>
                    )}
                    {course.enrolled === false ? (
                        <span className="mt-3 inline-flex w-full justify-center rounded-lg bg-sand px-4 py-2.5 text-sm font-semibold text-ink/65">Acesso por matrícula</span>
                    ) : (
                        <Link className="mt-3 inline-flex min-h-11 w-full justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700" href={`/courses/${course.slug}`}>
                            {course.progress === 100 ? 'Revisar curso' : course.progress > 0 ? 'Continuar' : 'Começar'} <span aria-hidden className="ml-2">→</span>
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
