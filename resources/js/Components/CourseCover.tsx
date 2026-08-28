import { useState } from 'react';

type Props = {
    className?: string;
    thumbnailPath?: string | null;
    title: string;
};

function AsexPlaceholder({ className = '', title }: Pick<Props, 'className' | 'title'>) {
    return (
        <div aria-label={`Capa padrão do curso ${title}`} className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#130c1c_0%,#2b0870_54%,#09070d_100%)] p-6 text-white ${className}`} role="img">
            <span aria-hidden className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-[#9347dd]/25 blur-2xl" />
            <span aria-hidden className="absolute -bottom-16 -right-8 h-44 w-44 rotate-45 border border-white/20" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(145deg,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_49%)]" />
            <img alt="" aria-hidden className="relative h-auto w-[60%] min-w-[120px] max-w-[300px] object-contain" src="/brand/asex-educacao-logo-horizontal.png" />
        </div>
    );
}

export default function CourseCover({ className = '', thumbnailPath, title }: Props) {
    const [imageFailed, setImageFailed] = useState(false);

    const source = thumbnailPath
        ? (/^https?:\/\//.test(thumbnailPath) ? thumbnailPath : `/storage/${thumbnailPath}`)
        : null;

    if (!source || imageFailed) {
        return <AsexPlaceholder className={className} title={title} />;
    }

    return <img alt={`Capa do curso ${title}`} className={`h-full w-full object-cover ${className}`} loading="lazy" onError={() => setImageFailed(true)} src={source} />;
}
