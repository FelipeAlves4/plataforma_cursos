type Props = { provider: 'youtube' | 'panda'; videoId?: string | null; videoUrl?: string | null; title: string };

function extractYouTubeId(videoId?: string | null, videoUrl?: string | null): string | null {
    if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) return videoId;
    if (!videoUrl) return null;
    try {
        const url = new URL(videoUrl);
        if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) return url.pathname.slice(1).split('/')[0] || null;
        if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;
        return url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1] || null;
    } catch { return null; }
}

export default function VideoPlayer({ provider, videoId, videoUrl, title }: Props) {
    const youtubeId = extractYouTubeId(videoId, videoUrl);
    const source = provider === 'youtube' ? (youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0` : null) : videoUrl;
    if (!source) return <div role="alert" className="flex aspect-video items-center justify-center rounded-2xl bg-ink p-6 text-center text-white/65">Este vídeo ainda não possui uma fonte válida configurada.</div>;
    return <div className="overflow-hidden rounded-2xl bg-ink shadow-2xl"><iframe className="aspect-video w-full" src={source} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
}
