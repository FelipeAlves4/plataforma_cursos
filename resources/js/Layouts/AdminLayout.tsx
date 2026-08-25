import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import AppLayout from './AppLayout';

export default function AdminLayout({ children }: PropsWithChildren) {
    return <AppLayout><div className="mb-8 flex flex-wrap gap-4 border-b border-slate-200 pb-4 text-sm font-semibold text-slate-600"><Link href="/admin/courses" className="hover:text-indigo-700">Cursos</Link></div>{children}</AppLayout>;
}
