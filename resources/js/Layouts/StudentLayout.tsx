import BrandLogo from '@/Components/BrandLogo';
import { PageProps } from '@/types';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
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
    const isHome = url.startsWith('/dashboard');
    const isLearningRoute = url.startsWith('/my-courses') || /^\/courses\/[^/]+$/.test(url) || url.startsWith('/lessons/');

    const desktopLinks = [
        { href: '/dashboard', label: 'Início', active: isHome },
        { href: '/my-courses', label: 'Minha lista', active: isLearningRoute },
        { href: '/courses', label: 'Explorar', active: url === '/courses' },
    ];

    const mobileLinks: { href: string; label: string; icon: IconName; active: boolean }[] = [
        { href: '/dashboard', label: 'Início', icon: 'home', active: isHome },
        { href: '/my-courses', label: 'Minha lista', icon: 'book', active: isLearningRoute },
        { href: '/courses', label: 'Explorar', icon: 'compass', active: url === '/courses' },
        { href: '/certificates', label: 'Certificados', icon: 'certificate', active: url.startsWith('/certificates') },
        { href: '/profile', label: 'Perfil', icon: 'profile', active: url.startsWith('/profile') },
    ];

    return (
        <div className="student-shell min-h-screen overflow-x-hidden bg-[#08070d] text-white">
            <div aria-hidden className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_82%_0%,rgba(129,56,197,0.11),transparent_28%),radial-gradient(ellipse_at_5%_100%,rgba(61,19,112,0.18),transparent_26%)]" />

            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.045] bg-[linear-gradient(180deg,rgba(7,6,11,.96)_0%,rgba(7,6,11,.78)_58%,rgba(7,6,11,.3)_100%)] backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] w-full max-w-[1760px] items-center justify-between gap-5 px-5 sm:px-8 lg:h-[76px] lg:px-12 xl:px-16">
                    <div className="flex min-w-0 items-center gap-8 lg:gap-10">
                        <Link aria-label="ASEX — início" className="shrink-0" href="/dashboard">
                            <BrandLogo className="h-8 w-28 sm:h-9 sm:w-32" />
                        </Link>
                        <nav aria-label="Navegação principal do aluno" className="hidden items-center gap-7 md:flex">
                            {desktopLinks.map((link) => (
                                <Link
                                    className={`relative py-7 text-sm font-semibold transition ${link.active ? 'text-white' : 'text-white/58 hover:text-white'}`}
                                    href={link.href}
                                    key={link.label}
                                >
                                    {link.label}
                                    {link.active && <span aria-hidden className="absolute inset-x-0 bottom-[18px] mx-auto h-0.5 w-5 rounded-full bg-[#a855f7]" />}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <Menu as="div" className="relative">
                        <MenuButton className="flex items-center gap-2.5 rounded-full border border-white/[0.09] bg-black/20 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#6429aa,#a855f7)] text-xs font-black text-white">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden max-w-28 truncate sm:block">{auth.user.name.split(' ')[0]}</span>
                            <svg aria-hidden className="hidden h-4 w-4 text-white/45 sm:block" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path d="m8 10 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </MenuButton>

                        <MenuItems
                            transition
                            className="absolute right-0 top-full mt-3 w-60 origin-top-right overflow-hidden rounded-xl border border-white/[0.1] bg-[#121017]/98 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.5)] backdrop-blur-2xl transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
                        >
                            <div className="border-b border-white/[0.07] px-3 py-3">
                                <p className="truncate text-sm font-bold text-white">{auth.user.name}</p>
                                <p className="mt-0.5 text-xs font-medium text-white/40">Conta do aluno</p>
                            </div>

                            <div className="py-1.5">
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/68'}`} href="/profile">
                                            <Icon name="profile" />
                                            Perfil
                                        </Link>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/68'}`} href="/certificates">
                                            <Icon name="certificate" />
                                            Certificados
                                        </Link>
                                    )}
                                </MenuItem>
                            </div>

                            <div className="border-t border-white/[0.07] pt-1.5">
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link as="button" className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${focus ? 'bg-white/[0.07] text-white' : 'text-white/52'}`} href="/logout" method="post">
                                            <Icon name="logout" />
                                            Sair da plataforma
                                        </Link>
                                    )}
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Menu>
                </div>
            </header>

            <main className={`relative mx-auto w-full max-w-[1760px] pb-28 lg:pb-16 ${isHome ? 'pt-0' : 'px-5 pt-24 sm:px-8 sm:pt-28 lg:px-12 xl:px-16'}`}>
                {children}
            </main>

            <nav aria-label="Navegação móvel do aluno" className="fixed inset-x-0 bottom-0 z-40 flex h-[76px] items-center justify-around border-t border-white/[0.09] bg-[#0b0a10]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
                {mobileLinks.map((link) => (
                    <Link
                        className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] ${link.active ? 'text-[#c28aff]' : 'text-white/48'}`}
                        href={link.href}
                        key={link.label}
                    >
                        <Icon name={link.icon} />
                        <span className="truncate">{link.label}</span>
                    </Link>
                ))}
            </nav>

            {flash?.success && (
                <div aria-live="polite" className="fixed bottom-24 right-4 z-50 max-w-sm rounded-xl border border-white/10 bg-[#17111f]/95 px-5 py-4 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl md:bottom-6">
                    {flash.success}
                </div>
            )}
        </div>
    );
}
