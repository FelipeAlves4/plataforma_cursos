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
    progress: number;
};

export default function ContinueLearningCard({ lessonId, lessonTitle, moduleTitle, courseTitle, courseSlug, thumbnailPath, progress }: Props) {
    return (
        <section className="group overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#131018] text-white shadow-[0_24px_64px_rgba(0,0,0,.24)] md:grid md:grid-cols-[minmax(19rem,.9fr)_minmax(0,1.1fr)]">
            <div className="relative aspect-[16/9] min-h-56 overflow-hidden md:aspect-auto">
                <CourseCover thumbnailPath={thumbnailPath} title={courseTitle} />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,transparent_10%,#131018_100%)]" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c28aff]">Em andamento</p>
                <p className="mt-4 text-sm font-semibold text-white/60">{courseTitle}</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">{lessonTitle}</h2>
                <p className="mt-2 text-sm text-white/55">{moduleTitle}</p>
                <div className="mt-7 max-w-lg"><ProgressBar label="Seu progresso" value={progress} tone="dark" /></div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link className="asex-gradient inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:brightness-110" href={`/lessons/${lessonId}`}>Continuar aula <span aria-hidden className="ml-2">→</span></Link>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]" href={`/courses/${courseSlug}`}>Ver curso</Link>
                </div>
            </div>
        </section>
    );
}
