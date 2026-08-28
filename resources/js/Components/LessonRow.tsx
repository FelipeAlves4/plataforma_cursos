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
    href?: string;
    onNavigate?: () => void;
};

const duration = (seconds?: number | null) => seconds ? `${Math.ceil(seconds / 60)} min` : null;
const youtubeThumbnail = (videoId?: string | null) => videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

export default function LessonRow({ id, title, number, completed, current = false, durationSeconds, videoId, compact = false, href, onNavigate }: Props) {
    const state = completed ? '✓' : current ? '▶' : '○';

    return (
        <Link aria-current={current ? 'step' : undefined} className={`group flex items-center gap-3 border border-transparent px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${current ? 'border-[#9347dd]/45 bg-[#6429aa]/25 shadow-[inset_3px_0_0_#9347dd]' : 'hover:bg-white/[0.045]'}`} href={href ?? `/lessons/${id}`} onClick={onNavigate}>
            {!compact && <div className="hidden h-10 w-16 shrink-0 overflow-hidden rounded-md bg-white/5 sm:block">{youtubeThumbnail(videoId) ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={youtubeThumbnail(videoId)!} /> : <span aria-hidden className="grid h-full w-full place-items-center text-white/30">▶</span>}</div>}
            <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${current ? 'bg-brand-500 text-white' : completed ? 'bg-brand-500/20 text-brand-300' : 'bg-white/[0.07] text-white/35'}`}>{state}</span>
            <span className="min-w-0 flex-1"><span className="mr-2 text-xs font-bold text-white/35">{String(number).padStart(2, '0')}.</span><span className={`text-sm ${current ? 'font-bold text-white' : 'font-medium text-white/70 group-hover:text-white'}`}>{title}</span></span>
            {duration(durationSeconds) && <span className="shrink-0 text-xs font-semibold text-white/35">{duration(durationSeconds)}</span>}
        </Link>
    );
}
