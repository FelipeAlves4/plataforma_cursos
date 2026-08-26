import BrandLogo from '@/Components/BrandLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
    const { props: { auth, flash }, url } = usePage<PageProps>();
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
            { href: '/courses', label: 'Meus cursos' },
            { href: '/courses', label: 'Explorar' },
        ];

    return (
        <div className="min-h-screen bg-cream text-ink">
            <header className={`sticky top-0 z-30 border-b backdrop-blur ${isAdmin ? 'border-white/10 bg-ink text-white' : 'border-asex-border/80 bg-white/95 text-ink'}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[4.5rem] items-center justify-between gap-4">
                        <BrandLogo href={homeHref} className="h-10 w-36" />
                        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-semibold md:flex">
                            {links.map((link, index) => <Link key={`${link.href}-${index}`} href={link.href} className={`transition ${isAdmin ? 'text-white/75 hover:text-white' : `${url.startsWith(link.href) && (link.href !== '/courses' || index === 1) ? 'text-brand-700' : 'text-ink/60 hover:text-ink'}`}`}>{link.label}</Link>)}
                            <Link href="/profile" className={`inline-flex items-center gap-2 rounded-full px-2 py-1.5 transition ${isAdmin ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-sand text-ink hover:bg-brand-100'}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${isAdmin ? 'bg-white/15' : 'asex-gradient text-white'}`}>{auth.user.name.charAt(0).toUpperCase()}</span><span className="max-w-28 truncate pr-1">{auth.user.name}</span></Link>
                            <Link as="button" className={`transition ${isAdmin ? 'text-white/75 hover:text-white' : 'text-ink/50 hover:text-ink'}`} href="/logout" method="post">Sair</Link>
                        </nav>
                        <button type="button" aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className={`rounded-lg p-2 md:hidden ${isAdmin ? 'text-white hover:bg-white/10 focus-visible:ring-white' : 'text-ink hover:bg-sand'}`}>
                            <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
                            <span aria-hidden className="text-xl">{menuOpen ? '×' : '☰'}</span>
                        </button>
                    </div>
                    {menuOpen && <nav id="mobile-navigation" aria-label="Navegação móvel" className={`border-t py-3 md:hidden ${isAdmin ? 'border-white/10' : 'border-asex-border'}`}>
                        {links.map((link, index) => <Link key={`${link.href}-${index}`} href={link.href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-sm font-semibold ${isAdmin ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-ink/70 hover:bg-sand hover:text-ink'}`}>{link.label}</Link>)}
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-sm font-semibold ${isAdmin ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-ink/70 hover:bg-sand hover:text-ink'}`}>Meu perfil</Link>
                        <Link as="button" className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${isAdmin ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-ink/70 hover:bg-sand hover:text-ink'}`} href="/logout" method="post" onClick={() => setMenuOpen(false)}>Sair</Link>
                    </nav>}
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
            {flash?.success && <div aria-live="polite" className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-xl">{flash.success}</div>}
        </div>
    );
}
