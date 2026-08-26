import CourseCover from '@/Components/CourseCover';
import ProgressBar from '@/Components/ProgressBar';
import { Link } from '@inertiajs/react';

type Props = {
    lessonId: number;
    lessonTitle: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
    thumbnailPath?: string | null;
    videoId?: string | null;
    progress: number;
};

export default function ContinueLearningCard({ lessonId, lessonTitle, moduleTitle, courseTitle, courseSlug, thumbnailPath, videoId, progress }: Props) {
    return (
        <section className="overflow-hidden rounded-3xl bg-ink text-white shadow-xl shadow-brand-900/10 md:grid md:grid-cols-[minmax(16rem,.85fr)_minmax(0,1.15fr)]">
            <div className="aspect-[16/9] min-h-56 md:aspect-auto">
                <CourseCover thumbnailPath={thumbnailPath} title={courseTitle} videoId={videoId} />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="eyebrow text-brand-300">Continuar estudando</p>
                <p className="mt-3 text-sm font-semibold text-white/65">{courseTitle} · {moduleTitle}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{lessonTitle}</h2>
                <div className="mt-7 max-w-lg"><ProgressBar label="Seu progresso" value={progress} tone="dark" /></div>
                <p className="mt-4 text-sm text-white/65">Próxima etapa da sua jornada em {courseTitle}.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-100" href={`/lessons/${lessonId}`}>Continuar aula <span aria-hidden className="ml-2">→</span></Link>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10" href={`/courses/${courseSlug}`}>Ver curso</Link>
                </div>
            </div>
        </section>
    );
}
