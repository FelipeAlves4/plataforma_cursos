import { useEffect, useMemo, useState } from 'react';

type Props = { provider: 'youtube' | 'panda'; videoId?: string | null; videoUrl?: string | null; title: string };

function extractYouTubeId(videoId?: string | null, videoUrl?: string | null): string | null {
    if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) return videoId;
    if (!videoUrl) return null;

    try {
        const url = new URL(videoUrl);
        if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) return url.pathname.slice(1).split('/')[0] || null;
        if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;

        return url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1] || null;
    } catch {
        return null;
    }
}

export default function VideoPlayer({ provider, videoId, videoUrl, title }: Props) {
    const youtubeId = useMemo(() => extractYouTubeId(videoId, videoUrl), [videoId, videoUrl]);
    const source = provider === 'youtube' ? (youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0` : null) : videoUrl;
    const youtubeUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<'loading' | 'ready' | 'slow'>('loading');

    useEffect(() => {
        setState('loading');
        const timeout = window.setTimeout(() => setState((current) => current === 'loading' ? 'slow' : current), 9000);

        return () => window.clearTimeout(timeout);
    }, [source, attempt]);

    if (!source) return <div role="alert" className="flex aspect-video items-center justify-center rounded-2xl bg-ink p-6 text-center text-white/65">Este vídeo ainda não possui uma fonte válida configurada.</div>;

    const retry = () => {
        setState('loading');
        setAttempt((current) => current + 1);
    };

    return <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-2xl">
        <iframe className="h-full w-full" key={attempt} onError={() => setState('slow')} onLoad={() => setState('ready')} src={source} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        {state === 'loading' && <div aria-live="polite" className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#15101b_8%,#2b1b38_18%,#15101b_33%)] bg-[length:200%_100%]"><span className="sr-only">Carregando vídeo</span></div>}
        {state === 'slow' && <div className="absolute inset-0 grid place-items-center bg-[#09070d]/90 p-6 text-center"><div><p className="text-base font-black text-white">O vídeo está demorando para carregar.</p><p className="mt-2 text-sm leading-6 text-white/60">Você pode tentar carregar novamente ou assistir diretamente no YouTube.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" onClick={retry} type="button">Tentar novamente</button>{youtubeUrl && <a className="asex-gradient inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href={youtubeUrl} rel="noopener noreferrer" target="_blank">Abrir no YouTube <span aria-hidden className="ml-2">↗</span></a>}</div></div></div>}
    </div>;
}
