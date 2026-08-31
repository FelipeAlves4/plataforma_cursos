import BrandLogo from '@/Components/BrandLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type IconName = 'home' | 'book' | 'compass' | 'certificate' | 'profile' | 'logout';

const icons: Record<IconName, JSX.Element> = {
    home: <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.25v-6h-6.5v6H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" />,
    book: <><path d="M4 5.75A2.75 2.75 0 0 1 6.75 3H11v16H6.75A2.75 2.75 0 0 0 4 21V5.75Z" /><path d="M20 5.75A2.75 2.75 0 0 0 17.25 3H13v16h4.25A2.75 2.75 0 0 1 20 21V5.75Z" /></>,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m14.75 9.25-2 4-4 2 2-4 4-2Z" /></>,
    certificate: <><path d="M7 3h10v11H7z" /><path d="m9 14-2 7 5-2 5 2-2-7" /><path d="M9.5 7.5h5" /></>,
    profile: <><circle cx="12" cy="8" r="3.25" /><path d="M5 21c.65-3.25 3.1-5 7-5s6.35 1.75 7 5" /></>,
    logout: <><path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" /><path d="m14 8 4 4-4 4M18 12H9" /></>,
};

function Icon({ name }: { name: IconName }) {
    return <svg aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">{icons[name]}</svg>;
}

export default function StudentLayout({ children }: PropsWithChildren) {
    const { props: { auth, flash }, url } = usePage<PageProps>();
    const links: { href: string; label: string; icon: IconName; active: boolean }[] = [
        { href: '/dashboard', label: 'Início', icon: 'home', active: url.startsWith('/dashboard') },
        { href: '/my-courses', label: 'Meus cursos', icon: 'book', active: url.startsWith('/my-courses') },
        { href: '/courses', label: 'Disponível', icon: 'compass', active: url.startsWith('/courses') },
        { href: '/certificates', label: 'Certificados', icon: 'certificate', active: url.startsWith('/certificates') },
        { href: '/profile', label: 'Perfil', icon: 'profile', active: url.startsWith('/profile') },
    ];

    return (
        <div className="student-shell min-h-screen overflow-x-hidden bg-[#08070d] text-white">
            <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_88%_0%,rgba(129,56,197,0.13),transparent_30%),radial-gradient(ellipse_at_5%_98%,rgba(61,19,112,0.24),transparent_24%)]" />
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.08] bg-[#0a0910]/85 px-4 py-7 backdrop-blur-2xl lg:flex">
                <Link aria-label="ASEX — início" className="px-3" href="/dashboard"><BrandLogo className="h-10 w-36" /></Link>
                <p className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Sua jornada</p>
                <nav aria-label="Navegação do aluno" className="mt-3 space-y-1.5">
                    {links.map((link) => <Link className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] ${link.active ? 'bg-[#21142e] text-white shadow-[inset_3px_0_0_#a855f7]' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`} href={link.href} key={link.label}><Icon name={link.icon} /><span>{link.label}</span></Link>)}
                </nav>
                <div className="mt-auto border-t border-white/[0.08] pt-4">
                    <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" href="/profile"><span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#6527a8,#a855f7)] text-sm font-black text-white">{auth.user.name.charAt(0).toUpperCase()}</span><span className="min-w-0"><span className="block truncate">{auth.user.name}</span><span className="mt-0.5 block text-xs font-medium text-white/42">Meu perfil</span></span></Link>
                    <Link as="button" className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/45 transition hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" href="/logout" method="post"><Icon name="logout" /><span>Sair da plataforma</span></Link>
                </div>
            </aside>

            <main className="relative mx-auto w-full max-w-[1760px] px-5 pb-28 pt-5 sm:px-8 sm:pt-8 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-12 lg:pb-14 xl:px-16">
                <header className="mb-6 flex items-center justify-between lg:hidden"><Link aria-label="ASEX — início" href="/dashboard"><BrandLogo className="h-8 w-28" /></Link><Link aria-label="Abrir perfil" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-sm font-black text-white" href="/profile">{auth.user.name.charAt(0).toUpperCase()}</Link></header>
                {children}
            </main>

            <nav aria-label="Navegação móvel do aluno" className="fixed inset-x-0 bottom-0 z-30 flex h-[76px] items-center justify-around border-t border-white/[0.09] bg-[#0b0a10]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
                {links.map((link) => <Link className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] ${link.active ? 'text-[#c28aff]' : 'text-white/52'}`} href={link.href} key={link.label}><Icon name={link.icon} /><span className="truncate">{link.label}</span></Link>)}
            </nav>
            {flash?.success && <div aria-live="polite" className="fixed bottom-24 right-4 z-40 max-w-sm rounded-xl border border-white/10 bg-[#1c1425] px-5 py-4 text-sm font-semibold text-white shadow-2xl lg:bottom-6">{flash.success}</div>}
        </div>
    );
}
