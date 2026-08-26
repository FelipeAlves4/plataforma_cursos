import CourseCover from '@/Components/CourseCover';
import { Link } from '@inertiajs/react';

type Props = {
    id: number;
    title: string;
    number: number;
    completed: boolean;
    current?: boolean;
    durationSeconds?: number | null;
    videoId?: string | null;
    compact?: boolean;
};

const duration = (seconds?: number | null) => seconds ? `${Math.ceil(seconds / 60)} min` : null;

export default function LessonRow({ id, title, number, completed, current = false, durationSeconds, videoId, compact = false }: Props) {
    const state = completed ? '✓' : current ? '▶' : '○';

    return (
        <Link aria-current={current ? 'step' : undefined} className={`group flex items-center gap-3 rounded-xl border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${current ? 'border-brand-300 bg-brand-100/70 shadow-sm' : 'border-transparent hover:border-asex-border hover:bg-sand/60'}`} href={`/lessons/${id}`}>
            {!compact && <div className="hidden h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-sand sm:block"><CourseCover title={title} videoId={videoId} /></div>}
            <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${current ? 'bg-brand-700 text-white' : completed ? 'bg-brand-100 text-brand-700' : 'bg-sand text-ink/50'}`}>{state}</span>
            <span className="min-w-0 flex-1"><span className="mr-2 text-xs font-bold text-ink/45">{String(number).padStart(2, '0')}.</span><span className={`text-sm ${current ? 'font-bold text-ink' : 'font-medium text-ink/75 group-hover:text-ink'}`}>{title}</span></span>
            {duration(durationSeconds) && <span className="shrink-0 text-xs font-semibold text-ink/45">{duration(durationSeconds)}</span>}
        </Link>
    );
}
