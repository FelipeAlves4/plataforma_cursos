import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><Link href="/dashboard" className="text-lg font-black tracking-tight text-indigo-700">Orbit Cursos</Link><nav className="flex items-center gap-4 text-sm font-medium text-slate-600"><Link href="/dashboard" className="hover:text-indigo-700">Meus cursos</Link>{auth.user.role === 'ADMIN' && <Link href="/admin/courses" className="hover:text-indigo-700">Administração</Link>}<Link href="/profile" className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">{auth.user.name}</Link></nav></div></header><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main></div>;
}
