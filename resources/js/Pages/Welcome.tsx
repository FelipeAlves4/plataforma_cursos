import BrandLogo from '@/Components/BrandLogo';
import PortalBackdrop from '@/Components/PortalBackdrop';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PointerEvent } from 'react';

type Course = { id: number; title: string; slug: string; description?: string | null; thumbnailPath?: string | null; category?: string | null; lessonCount: number };

export default function Welcome({ auth }: PageProps<{ courses: Course[] }>) {
    const moveBackdrop = (event: PointerEvent<HTMLDivElement>): void => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--portal-pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
        event.currentTarget.style.setProperty('--portal-pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    };

    return <>
        <Head title="Asex Educação"><meta content="Acesse seu ambiente ASEX Educação." name="description" /></Head>
        <div className="portal-shell" onPointerMove={moveBackdrop}>
            <PortalBackdrop />
            <header className="portal-header"><BrandLogo className="h-8 w-auto sm:h-9" href="/" /></header>
            <main className="portal-main portal-reveal">
                <div className="portal-copy">
                    <p className="portal-eyebrow">ASEX EDUCAÇÃO</p>
                    <h1>Seu próximo nível começa aqui.</h1>
                    <p className="portal-description">Acesse seu ambiente de conhecimento, desenvolvimento e expansão.</p>
                    <div className="portal-actions"><Link className="portal-primary-action" href={auth.user ? '/dashboard' : '/login'} prefetch>Acessar plataforma<span aria-hidden="true">→</span></Link><Link className="portal-secondary-action" href="/forgot-password">Primeiro acesso?</Link></div>
                </div>
            </main>
            <footer className="portal-footer"><span>© {new Date().getFullYear()} ASEX Educação</span><nav aria-label="Informações institucionais"><a href="#privacidade">Privacidade</a><a href="mailto:contato@asexeducacao.com.br">Suporte</a></nav></footer>
        </div>
    </>;
}
