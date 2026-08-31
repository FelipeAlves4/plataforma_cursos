import BrandLogo from '@/Components/BrandLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

type IconName = 'overview' | 'courses' | 'programs' | 'sales' | 'catalog' | 'profile' | 'logout' | 'menu' | 'close';

function Icon({ name }: { name: IconName }) {
    const paths: Record<IconName, ReactNode> = {
        overview: <><rect height="7" rx="1" width="7" x="3" y="3" /><rect height="7" rx="1" width="7" x="14" y="3" /><rect height="7" rx="1" width="7" x="3" y="14" /><rect height="7" rx="1" width="7" x="14" y="14" /></>,
        courses: <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H10v17H5.5A2.5 2.5 0 0 0 3 22V5.5Z" /><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H14v17h4.5A2.5 2.5 0 0 1 21 22V5.5Z" /></>,
        programs: <><rect height="14" rx="2" width="18" x="3" y="5" /><path d="M7 9h10M7 13h7" /></>,
        sales: <><path d="M5 21V9m7 12V3m7 18v-7" /><path d="M3 21h18" /></>,
        catalog: <><path d="M14 3h7v7" /><path d="m21 3-9 9" /><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
        profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
        logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
        menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
        close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    };

    return <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>;
}

const navigation = [
    { href: '/admin', icon: 'overview' as const, label: 'Visão geral' },
    { href: '/admin/courses', icon: 'courses' as const, label: 'Cursos' },
    { href: '/admin/programs', icon: 'programs' as const, label: 'Programas' },
    { href: '/admin/sales', icon: 'sales' as const, label: 'Vendas' },
];

function Navigation({ close }: { close?: () => void }) {
    const pathname = window.location.pathname;

    return <>
        <div className="border-b border-white/10 px-5 py-5"><BrandLogo className="h-9 w-auto" href="/admin" /></div>
        <nav aria-label="Navegação administrativa" className="flex flex-1 flex-col gap-1 px-3 py-5">
            {navigation.map((item) => {
                const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

                return <Link className={`admin-nav-link ${active ? 'admin-nav-link-active' : ''}`} href={item.href} key={item.href} onClick={close}><Icon name={item.icon} />{item.label}</Link>;
            })}
        </nav>
        <div className="space-y-1 border-t border-white/10 px-3 py-4">
            <Link className="admin-nav-link" href="/courses" onClick={close}><Icon name="catalog" />Ver catálogo</Link>
            <Link className="admin-nav-link" href="/profile" onClick={close}><Icon name="profile" />Perfil</Link>
            <Link as="button" className="admin-nav-link w-full" href="/logout" method="post"><Icon name="logout" />Sair</Link>
        </div>
    </>;
}

export default function AdminLayout({ children }: PropsWithChildren) {
    const [menuOpen, setMenuOpen] = useState(false);

    return <div className="admin-shell min-h-screen bg-[#08060D] text-[#F4F1FA]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#100C18] lg:flex"><Navigation /></aside>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#08060D]/95 px-4 backdrop-blur lg:hidden"><BrandLogo className="h-8 w-auto" href="/admin" /><button aria-expanded={menuOpen} aria-label="Abrir navegação administrativa" className="admin-icon-button" type="button" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button></header>
        {menuOpen && <div aria-label="Navegação administrativa" aria-modal="true" className="fixed inset-0 z-50 lg:hidden" role="dialog"><button aria-label="Fechar navegação" className="absolute inset-0 bg-black/65" type="button" onClick={() => setMenuOpen(false)} /><aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-[#100C18] shadow-2xl"><button aria-label="Fechar navegação" className="admin-icon-button absolute right-3 top-4" type="button" onClick={() => setMenuOpen(false)}><Icon name="close" /></button><Navigation close={() => setMenuOpen(false)} /></aside></div>}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-10 lg:py-10">{children}</main>
    </div>;
}
