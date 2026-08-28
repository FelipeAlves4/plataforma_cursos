import BrandLogo from '@/Components/BrandLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type IconName = 'home' | 'book' | 'compass' | 'profile' | 'logout';

const icons: Record<IconName, JSX.Element> = {
    home: <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.25v-6h-6.5v6H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" />,
    book: <><path d="M4 5.75A2.75 2.75 0 0 1 6.75 3H11v16H6.75A2.75 2.75 0 0 0 4 21V5.75Z" /><path d="M20 5.75A2.75 2.75 0 0 0 17.25 3H13v16h4.25A2.75 2.75 0 0 1 20 21V5.75Z" /></>,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m14.75 9.25-2 4-4 2 2-4 4-2Z" /></>,
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
        { href: '/courses', label: 'Explorar', icon: 'compass', active: url.startsWith('/courses') },
        { href: '/profile', label: 'Perfil', icon: 'profile', active: url.startsWith('/profile') },
    ];

    return (
        <div className="student-shell min-h-screen overflow-x-hidden bg-[#09070d] text-white">
            <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(129,56,197,0.18),transparent_31%),radial-gradient(ellipse_at_9%_95%,rgba(43,8,112,0.34),transparent_27%)]" />
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[104px] flex-col border-r border-white/[0.09] bg-[#0c0911]/85 px-3 py-7 backdrop-blur-xl lg:flex">
                <Link aria-label="ASEX — início" className="mx-auto" href="/dashboard"><BrandLogo className="h-9 w-16 object-contain" /></Link>
                <nav aria-label="Navegação do aluno" className="mt-12 space-y-3">
                    {links.map((link) => <Link className={`group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium transition duration-200 ${link.active ? 'bg-white/[0.08] text-[#c28aff]' : 'text-white/50 hover:bg-white/[0.05] hover:text-white'}`} href={link.href} key={link.label}><Icon name={link.icon} /><span className="text-center leading-3">{link.label}</span></Link>)}
                </nav>
                <div className="mt-auto space-y-3">
                    <Link className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white" href="/profile"><span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#6429aa,#9347dd)] text-xs font-black text-white">{auth.user.name.charAt(0).toUpperCase()}</span><span className="max-w-[80px] truncate">{auth.user.name}</span></Link>
                    <Link as="button" className="flex w-full flex-col items-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-white" href="/logout" method="post"><Icon name="logout" /><span>Sair</span></Link>
                </div>
            </aside>

            <main className="relative mx-auto w-full max-w-[1680px] px-5 pb-28 pt-6 sm:px-8 sm:pt-9 lg:ml-[104px] lg:w-[calc(100%-104px)] lg:px-12 lg:pb-12 xl:px-16">{children}</main>

            <nav aria-label="Navegação móvel do aluno" className="fixed inset-x-0 bottom-0 z-30 flex h-[76px] items-center justify-around border-t border-white/[0.09] bg-[#0c0911]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
                {links.map((link) => <Link className={`flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition ${link.active ? 'text-[#b875ff]' : 'text-white/45'}`} href={link.href} key={link.label}><Icon name={link.icon} /><span>{link.label}</span></Link>)}
            </nav>
            {flash?.success && <div aria-live="polite" className="fixed bottom-24 right-4 z-40 max-w-sm rounded-xl border border-white/10 bg-[#1c1425] px-5 py-4 text-sm font-semibold text-white shadow-2xl lg:bottom-6">{flash.success}</div>}
        </div>
    );
}
