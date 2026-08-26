import BrandLogo from '@/Components/BrandLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdmin = auth.user.role === 'ADMIN';
    const homeHref = isAdmin ? '/admin' : '/dashboard';
    const links = isAdmin
        ? [
            { href: '/admin', label: 'Visão geral' },
            { href: '/admin/courses', label: 'Cursos' },
            { href: '/courses', label: 'Catálogo' },
        ]
        : [
            { href: '/dashboard', label: 'Início' },
            { href: '/courses', label: 'Cursos' },
        ];

    return (
        <div className="min-h-screen bg-cream text-ink">
            <header className="border-b border-white/10 bg-ink text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <BrandLogo href={homeHref} className="h-10 w-36" />
                        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-semibold md:flex">
                            {links.map((link) => <Link key={link.href} href={link.href} className="text-white/75 transition hover:text-white">{link.label}</Link>)}
                            <Link href="/profile" className="rounded-full bg-white/10 px-3 py-1.5 text-white transition hover:bg-white/20">{auth.user.name}</Link>
                            <Link as="button" className="text-white/75 transition hover:text-white" href="/logout" method="post">Sair</Link>
                        </nav>
                        <button type="button" aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-white hover:bg-white/10 focus-visible:ring-white md:hidden">
                            <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
                            <span aria-hidden className="text-xl">{menuOpen ? '×' : '☰'}</span>
                        </button>
                    </div>
                    {menuOpen && <nav id="mobile-navigation" aria-label="Navegação móvel" className="border-t border-white/10 py-3 md:hidden">
                        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">{link.label}</Link>)}
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">Meu perfil</Link>
                        <Link as="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white" href="/logout" method="post" onClick={() => setMenuOpen(false)}>Sair</Link>
                    </nav>}
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
            {flash?.success && <div aria-live="polite" className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-xl">{flash.success}</div>}
        </div>
    );
}
