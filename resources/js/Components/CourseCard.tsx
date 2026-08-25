import { Link } from '@inertiajs/react';
import ProgressBar from './ProgressBar';

type Props = { course: { title: string; slug: string; description?: string | null; thumbnailPath?: string | null; progress: number; lessonCount: number; }; };

export default function CourseCard({ course }: Props) {
    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex aspect-[16/8] items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-sky-600 p-6 text-center text-xl font-bold text-white">
                {course.thumbnailPath ? <img className="h-full w-full object-cover" src={`/storage/${course.thumbnailPath}`} alt="" /> : course.title}
            </div>
            <div className="space-y-5 p-6"><div><p className="text-sm font-medium text-indigo-600">{course.lessonCount} aulas</p><h2 className="mt-1 text-xl font-bold text-slate-900">{course.title}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.description}</p></div><ProgressBar value={course.progress} /><Link className="inline-flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700" href={`/courses/${course.slug}`}>Continuar estudando</Link></div>
        </article>
    );
}
