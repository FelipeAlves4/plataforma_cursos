import { Link } from '@inertiajs/react';

type Props = {
    className?: string;
    href?: string;
    variant?: 'horizontal' | 'vertical';
};

export default function BrandLogo({
    className = '',
    href,
    variant = 'horizontal',
}: Props) {
    const image = (
        <img
            alt="Asex Educação"
            className={`shrink-0 object-contain ${className}`}
            src={`/brand/asex-educacao-logo${variant === 'horizontal' ? '-horizontal' : ''}.png`}
        />
    );

    return href ? <Link href={href}>{image}</Link> : image;
}
