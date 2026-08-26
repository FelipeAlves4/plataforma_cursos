import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type Props = {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: { href: string; label: string };
    children?: ReactNode;
};

export default function SectionHeader({ eyebrow, title, description, action, children }: Props) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                {eyebrow && <p className="eyebrow text-brand-700">{eyebrow}</p>}
                <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h2>
                {description && <p className="mt-2 text-sm text-ink/60 sm:text-base">{description}</p>}
            </div>
            {children ?? (action && <Link className="rounded-lg px-1 py-2 text-sm font-bold text-brand-700 transition hover:text-brand-900" href={action.href}>{action.label} →</Link>)}
        </div>
    );
}
