import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    return <div className="min-h-screen bg-cream text-ink"><header className="border-b border-ink/10 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><Link href="/dashboard" className="text-lg font-black tracking-tight text-ink">ASEX <span className="font-medium text-brand-700">Educação</span></Link><nav className="flex items-center gap-3 text-sm font-medium text-ink/70 sm:gap-5"><Link href="/dashboard" className="hover:text-brand-700">Início</Link><Link href="/courses" className="hover:text-brand-700">Cursos</Link>{auth.user.role === 'ADMIN' && <Link href="/admin" className="hidden hover:text-brand-700 sm:inline">Administração</Link>}<Link href="/profile" className="rounded-full bg-sand px-3 py-1.5 hover:bg-brand-100">{auth.user.name}</Link></nav></div></header><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main></div>;
}
