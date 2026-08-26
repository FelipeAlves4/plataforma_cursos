import { Link } from '@inertiajs/react';
import CourseCover from './CourseCover';
import ProgressBar from './ProgressBar';

type Props = { course: { title: string; slug: string; description?: string | null; thumbnailPath?: string | null; videoId?: string | null; category?: string | null; level?: string | null; progress: number; lessonCount: number; moduleCount?: number; durationMinutes?: number | null; enrolled?: boolean; status?: string; }; detail?: string };

export default function CourseCard({ course, detail }: Props) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-asex-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
            <div className="aspect-video overflow-hidden"><CourseCover className="transition duration-500 group-hover:scale-[1.03]" thumbnailPath={course.thumbnailPath} title={course.title} videoId={course.videoId} /></div>
            <div className="flex min-h-72 flex-col p-5 sm:p-6"><div><p className="text-sm font-semibold text-brand-700">{detail || [course.category, course.level].filter(Boolean).join(' · ') || `${course.lessonCount} aulas`}</p><h2 className="mt-2 text-xl font-black leading-snug text-ink">{course.title}</h2>{course.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{course.description}</p>}</div><div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-ink/50"><span>{course.lessonCount} aulas</span>{course.moduleCount ? <span>{course.moduleCount} módulos</span> : null}{course.durationMinutes ? <span>{course.durationMinutes} min</span> : null}</div><div className="mt-auto pt-5">{course.enrolled !== false && <><ProgressBar value={course.progress} /><p className={`mt-3 text-xs font-bold ${course.progress === 100 ? 'text-asex-success' : 'text-ink/55'}`}>{course.progress === 100 ? '✓ Curso concluído' : course.progress > 0 ? `${course.progress}% concluído` : 'Pronto para começar'}</p></>}{course.enrolled === false ? <span className="mt-3 inline-flex w-full justify-center rounded-lg bg-sand px-4 py-2.5 text-sm font-semibold text-ink/65">Acesso por matrícula</span> : <Link className="mt-3 inline-flex min-h-11 w-full justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700" href={`/courses/${course.slug}`}>{course.progress === 100 ? 'Revisar curso' : course.progress > 0 ? 'Continuar' : 'Começar'} <span aria-hidden className="ml-2">→</span></Link>}</div></div>
        </article>
    );
}
