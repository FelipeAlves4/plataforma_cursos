import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PlayerState = 'idle' | 'loading' | 'ready' | 'slow';
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
    const [state, setState] = useState<PlayerState>('idle');
    const timeoutRef = useRef<number | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const activeLoadKeyRef = useRef<string | null>(null);
    const lifecycleRef = useRef<PlayerState>('idle');
    const loadKey = source ? `${source}::${attempt}` : '';

    const clearLoadingTimeout = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const markSlow = useCallback((key: string) => {
        if (activeLoadKeyRef.current !== key || lifecycleRef.current !== 'loading') return;

        clearLoadingTimeout();
        lifecycleRef.current = 'slow';
        setState('slow');
    }, [clearLoadingTimeout]);

    const markReady = useCallback((key: string) => {
        if (activeLoadKeyRef.current !== key) return;

        clearLoadingTimeout();
        lifecycleRef.current = 'ready';
        setState('ready');
    }, [clearLoadingTimeout]);

    const startLoading = useCallback((key: string) => {
        clearLoadingTimeout();
        activeLoadKeyRef.current = key;
        lifecycleRef.current = 'loading';
        setState('loading');
        timeoutRef.current = window.setTimeout(() => markSlow(key), 9000);
    }, [clearLoadingTimeout, markSlow]);

    useEffect(() => {
        if (!source) {
            clearLoadingTimeout();
            activeLoadKeyRef.current = null;
            lifecycleRef.current = 'idle';
            setState('idle');

            return;
        }

        startLoading(loadKey);

        return () => {
            if (activeLoadKeyRef.current === loadKey) {
                clearLoadingTimeout();
            }
        };
    }, [clearLoadingTimeout, loadKey, source, startLoading]);

    useEffect(() => {
        if (!source) return;

        const iframe = iframeRef.current;
        const handleNativeLoad = () => markReady(loadKey);
        iframe?.addEventListener('load', handleNativeLoad);

        return () => iframe?.removeEventListener('load', handleNativeLoad);
    }, [loadKey, markReady, source]);

    const retry = () => {
        clearLoadingTimeout();
        activeLoadKeyRef.current = null;
        lifecycleRef.current = 'loading';
        setState('loading');
        setAttempt((current) => current + 1);
    };

    if (!source) {
        return <div className="flex aspect-video items-center justify-center rounded-2xl bg-ink p-6 text-center text-white/75" role="alert">Este vídeo ainda não possui uma fonte válida configurada.</div>;
    }

    return <div className="space-y-3"><div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-2xl">
        <iframe className="h-full w-full" key={loadKey} onError={() => markSlow(loadKey)} onLoad={() => markReady(loadKey)} ref={iframeRef} src={source} title={`Vídeo da aula: ${title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        {state === 'loading' ? <div aria-live="polite" className="pointer-events-none absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#15101b_8%,#2b1b38_18%,#15101b_33%)] bg-[length:200%_100%]"><span className="sr-only">Carregando vídeo</span></div> : null}
    </div>{state === 'slow' ? <div aria-live="polite" className="flex flex-col gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] p-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between" role="status"><p>O vídeo está demorando para responder.</p><div className="flex flex-wrap gap-3"><button className="min-h-10 rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" onClick={retry} type="button">Tentar novamente</button>{youtubeUrl ? <a className="inline-flex min-h-10 items-center rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" href={youtubeUrl} rel="noopener noreferrer" target="_blank">Abrir no YouTube <span aria-hidden className="ml-2">↗</span></a> : null}</div></div> : null}</div>;
}
