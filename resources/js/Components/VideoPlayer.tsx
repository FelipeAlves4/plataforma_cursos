type Props = {
    provider: 'youtube' | 'panda';
    videoId?: string | null;
    videoUrl?: string | null;
    title: string;
};

function youtubeId(videoId?: string | null, videoUrl?: string | null): string | null {
    if (videoId) return videoId;
    if (!videoUrl) return null;

    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/i);

    return match?.[1] ?? null;
}

export default function VideoPlayer({ provider, videoId, videoUrl, title }: Props) {
    const id = youtubeId(videoId, videoUrl);
    const source = provider === 'youtube' ? (id ? `https://www.youtube-nocookie.com/embed/${id}` : null) : videoUrl;

    if (!source) {
        return <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-950 p-6 text-center text-slate-300">Este vídeo ainda não possui uma URL de incorporação configurada.</div>;
    }

    return <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-950/20"><iframe className="aspect-video w-full" src={source} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
}
