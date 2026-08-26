import { Link } from '@inertiajs/react';
import CourseCover from './CourseCover';
import ProgressBar from './ProgressBar';

type Props = { course: { title: string; slug: string; description?: string | null; thumbnailPath?: string | null; progress: number; lessonCount: number; enrolled?: boolean; status?: string; }; detail?: string };

export default function CourseCard({ course, detail }: Props) {
    return (
        <article className="overflow-hidden rounded-2xl border border-asex-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-[16/8] overflow-hidden"><CourseCover thumbnailPath={course.thumbnailPath} title={course.title} /></div>
            <div className="space-y-5 p-6"><div><p className="text-sm font-medium text-brand-700">{detail || `${course.lessonCount} aulas`}</p><h2 className="mt-1 text-xl font-bold text-ink">{course.title}</h2><p className="mt-2 line-clamp-2 text-sm text-ink/65">{course.description}</p></div>{course.enrolled !== false && <><ProgressBar value={course.progress} /><p className="text-xs font-semibold text-ink/55">{course.progress === 100 ? 'Concluído' : course.progress > 0 ? 'Em andamento' : 'Não iniciado'}</p></>}{course.enrolled === false ? <span className="inline-flex w-full justify-center rounded-lg bg-sand px-4 py-2.5 text-sm font-semibold text-ink/65">Acesso por matrícula</span> : <Link className="inline-flex w-full justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700" href={`/courses/${course.slug}`}>{course.progress > 0 ? 'Continuar estudando' : 'Ver curso'}</Link>}</div>
        </article>
    );
}
