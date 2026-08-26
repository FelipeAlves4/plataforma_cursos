import { useState } from 'react';

type Props = {
    className?: string;
    thumbnailPath?: string | null;
    videoId?: string | null;
    title: string;
};

function AsexPlaceholder({ className = '', title }: Pick<Props, 'className' | 'title'>) {
    return (
        <div aria-label={`Capa padrão do curso ${title}`} className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 p-6 text-white ${className}`} role="img">
            <span aria-hidden className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <span aria-hidden className="absolute -bottom-16 -right-8 h-44 w-44 rounded-full border-2 border-white/15" />
            <img alt="" aria-hidden className="relative h-auto w-[60%] min-w-[170px] max-w-[360px] object-contain" src="/brand/asex-educacao-logo-horizontal.png" />
        </div>
    );
}

export default function CourseCover({ className = '', thumbnailPath, title, videoId }: Props) {
    const [imageFailed, setImageFailed] = useState(false);

    const source = thumbnailPath
        ? (/^https?:\/\//.test(thumbnailPath) ? thumbnailPath : `/storage/${thumbnailPath}`)
        : videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    if (!source || imageFailed) {
        return <AsexPlaceholder className={className} title={title} />;
    }

    return <img alt={`Capa do curso ${title}`} className={`h-full w-full object-cover ${className}`} loading="lazy" onError={() => setImageFailed(true)} src={source} />;
}
