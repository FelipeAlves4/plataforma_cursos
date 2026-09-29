import ProgressBar from '@/Components/ProgressBar';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Student = {
    id: number;
    name: string;
    email: string;
    courseCount: number;
    completedCourses: number;
    averageProgress: number;
    lastActivityAt?: string | null;
    status: 'Ativo' | 'Inativo' | 'Não iniciou' | 'Sem matrícula';
};

const filters = ['Todos', 'Ativo', 'Inativo', 'Não iniciou', 'Sem matrícula'] as const;
type Filter = (typeof filters)[number];

function statusClass(status: Student['status']): string {
    return status === 'Ativo'
        ? 'bg-emerald-400/12 text-emerald-200'
        : status === 'Não iniciou'
            ? 'bg-amber-400/12 text-amber-100'
            : status === 'Inativo'
                ? 'bg-rose-400/12 text-rose-200'
                : 'bg-white/[0.07] text-white/50';
}

function formatActivity(value?: string | null): string {
    if (!value) return 'Sem atividade';

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function Directory({ students }: { students: Student[] }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('Todos');

    const visibleStudents = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return students.filter((student) => {
            const matchesQuery = !normalized || student.name.toLowerCase().includes(normalized) || student.email.toLowerCase().includes(normalized);
            const matchesFilter = filter === 'Todos' || student.status === filter;

            return matchesQuery && matchesFilter;
        });
    }, [filter, query, students]);

    const activeStudents = students.filter((student) => student.status === 'Ativo').length;
    const attentionStudents = students.filter((student) => student.status === 'Inativo' || student.status === 'Não iniciou').length;

    return (
        <AdminLayout>
            <Head title="Alunos" />

            <section className="admin-page-header">
                <div>
                    <p className="admin-eyebrow">Relacionamento</p>
                    <h1>Alunos</h1>
                    <p>Acompanhe matrículas, progresso e atividade em um só lugar.</p>
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Base total</p>
                    <strong className="mt-3 block text-3xl font-black text-white">{students.length}</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">{students.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}</span>
                </article>
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Ativos</p>
                    <strong className="mt-3 block text-3xl font-black text-emerald-300">{activeStudents}</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">atividade nos últimos 30 dias</span>
                </article>
                <article className="admin-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8F84A8]">Precisam de atenção</p>
                    <strong className="mt-3 block text-3xl font-black text-amber-200">{attentionStudents}</strong>
                    <span className="mt-1 block text-sm text-[#AAA0B9]">inativos ou ainda não iniciaram</span>
                </article>
            </section>

            <section className="admin-panel mt-6 overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="font-black text-white">Diretório de alunos</h2>
                        <p className="mt-1 text-sm text-[#AAA0B9]">{visibleStudents.length} {visibleStudents.length === 1 ? 'resultado' : 'resultados'}</p>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <input
                            aria-label="Buscar aluno"
                            className="min-h-11 min-w-0 rounded-xl border-white/10 bg-[#0D0A13] text-sm text-white placeholder:text-white/30 focus:border-[#9d5bd4] focus:ring-[#9d5bd4] sm:min-w-72"
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por nome ou e-mail"
                            type="search"
                            value={query}
                        />
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {filters.map((item) => (
                                <button
                                    className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition ${filter === item ? 'border-[#c28aff] bg-[#6429aa]/35 text-white' : 'border-white/10 text-[#AAA0B9] hover:border-white/20 hover:text-white'}`}
                                    key={item}
                                    onClick={() => setFilter(item)}
                                    type="button"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {visibleStudents.length ? (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="admin-table min-w-[980px]">
                                <thead>
                                    <tr>
                                        <th>Aluno</th>
                                        <th>Cursos</th>
                                        <th>Concluídos</th>
                                        <th>Progresso médio</th>
                                        <th>Última atividade</th>
                                        <th>Status</th>
                                        <th className="text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td>
                                                <strong className="block text-[#F4F1FA]">{student.name}</strong>
                                                <small className="mt-1 block text-[#AAA0B9]">{student.email}</small>
                                            </td>
                                            <td>{student.courseCount}</td>
                                            <td>{student.completedCourses}</td>
                                            <td className="min-w-52">
                                                <ProgressBar tone="dark" value={student.averageProgress} />
                                            </td>
                                            <td>{formatActivity(student.lastActivityAt)}</td>
                                            <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(student.status)}`}>{student.status}</span></td>
                                            <td className="text-right"><Link className="admin-text-link" href={`/admin/students/${student.id}`}>Ver aluno</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-white/10 md:hidden">
                            {visibleStudents.map((student) => (
                                <article className="p-5" key={student.id}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <strong className="block truncate text-white">{student.name}</strong>
                                            <p className="mt-1 truncate text-sm text-[#AAA0B9]">{student.email}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(student.status)}`}>{student.status}</span>
                                    </div>
                                    <div className="mt-5">
                                        <ProgressBar tone="dark" value={student.averageProgress} />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                                        <span className="text-[#AAA0B9]">{student.courseCount} {student.courseCount === 1 ? 'curso' : 'cursos'}</span>
                                        <Link className="admin-text-link" href={`/admin/students/${student.id}`}>Ver aluno</Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="admin-empty-state py-16">
                        <p>Nenhum aluno encontrado com esses filtros.</p>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
