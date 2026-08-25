import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import AppLayout from './AppLayout';

export default function AdminLayout({ children }: PropsWithChildren) {
    return <AppLayout><div className="mb-8 flex flex-wrap gap-4 border-b border-ink/10 pb-4 text-sm font-semibold text-ink/65"><Link href="/admin" className="hover:text-brand-700">Visão geral</Link><Link href="/admin/courses" className="hover:text-brand-700">Cursos</Link></div>{children}</AppLayout>;
}
