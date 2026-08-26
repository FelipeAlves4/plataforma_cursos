import { useState } from 'react';

type Props = {
    className?: string;
    thumbnailPath?: string | null;
    title: string;
};

function AsexPlaceholder({ className = '', title }: Pick<Props, 'className' | 'title'>) {
    return (
        <div aria-label={`Capa padrão do curso ${title}`} className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 p-6 text-white ${className}`} role="img">
            <span aria-hidden className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <span aria-hidden className="absolute -bottom-16 -right-8 h-44 w-44 rounded-full border-2 border-white/15" />
            <div className="relative flex items-center gap-3 text-left drop-shadow-sm">
                <svg aria-hidden className="h-12 w-10 shrink-0" fill="none" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2 38 43H27l-7-17-7 17H2L20 2Z" fill="white" />
                    <path d="m15.5 32 4.5-10.5L24.5 32h-9Z" fill="#9347dd" />
                </svg>
                <span className="leading-none"><span className="block text-xl font-black tracking-[0.2em]">ASEX</span><span className="mt-1 block text-[10px] font-bold tracking-[0.28em] text-white/80">EDUCAÇÃO</span></span>
            </div>
        </div>
    );
}

export default function CourseCover({ className = '', thumbnailPath, title }: Props) {
    const [imageFailed, setImageFailed] = useState(false);

    if (!thumbnailPath || imageFailed) {
        return <AsexPlaceholder className={className} title={title} />;
    }

    const source = /^https?:\/\//.test(thumbnailPath) ? thumbnailPath : `/storage/${thumbnailPath}`;

    return <img alt={`Capa do curso ${title}`} className={`h-full w-full object-cover ${className}`} onError={() => setImageFailed(true)} src={source} />;
}
