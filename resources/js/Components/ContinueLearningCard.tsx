import CourseCover from '@/Components/CourseCover';
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

export default function ContinueLearningCard({ lessonId, lessonTitle, moduleTitle, courseTitle, thumbnailPath, progress }: Props) {
    return (
        <Link
            aria-label={`Continuar ${lessonTitle}`}
            className="group relative block min-w-[300px] overflow-hidden rounded-lg bg-[#15111a] shadow-[0_16px_38px_rgba(0,0,0,.35)] transition duration-300 hover:z-10 hover:shadow-[0_24px_60px_rgba(0,0,0,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] sm:min-w-[420px]"
            href={`/lessons/${lessonId}`}
        >
            <div className="relative aspect-video overflow-hidden">
                <CourseCover className="transition duration-700 motion-safe:group-hover:scale-[1.05]" thumbnailPath={thumbnailPath} title={courseTitle} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070d]/95 via-[#08070d]/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs text-[#08070d] shadow-lg">▶</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d0a5ff]">Continuar assistindo</span>
                    </div>
                    <p className="text-xs font-semibold text-white/56">{courseTitle}</p>
                    <h3 className="mt-1 line-clamp-1 text-base font-black leading-tight text-white sm:text-lg">{lessonTitle}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-white/45">{moduleTitle}</p>
                </div>

                <div aria-label={`${progress}% concluído`} className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                    <div className="h-full bg-[#a855f7]" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </Link>
    );
}
