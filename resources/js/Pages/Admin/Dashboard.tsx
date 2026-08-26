import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

type Props = {
    metrics: {
        students: number;
        courses: number;
        publishedCourses: number;
        draftCourses: number;
        lessons: number;
        enrollments: number;
    };
    recentCourses: {
        id: number;
        title: string;
        status: 'DRAFT' | 'PUBLISHED';
        lessonsCount: number;
        enrollmentsCount: number;
    }[];
    recentEnrollments: {
        id: number;
        enrolledAt: string | null;
        course: { id: number; title: string };
        student: { name: string; email: string };
    }[];
};

export default function Dashboard({ metrics, recentCourses, recentEnrollments }: Props) {
    const cards = [
        { label: 'Cursos', value: metrics.courses, detail: `${metrics.publishedCourses} publicados` },
        { label: 'Rascunhos', value: metrics.draftCourses, detail: 'Aguardando publicação' },
        { label: 'Alunos', value: metrics.students, detail: 'Contas de estudantes' },
        { label: 'Matrículas', value: metrics.enrollments, detail: 'Em todos os cursos' },
        { label: 'Aulas', value: metrics.lessons, detail: 'Conteúdos cadastrados' },
        { label: 'Publicados', value: metrics.publishedCourses, detail: 'Visíveis no catálogo' },
    ];

    return (
        <AdminLayout>
            <Head title="Administração" />

            <section className="overflow-hidden rounded-3xl bg-ink px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
                <p className="eyebrow text-brand-300">Área administrativa</p>
                <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Gestão da plataforma</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Acompanhe o catálogo, os conteúdos e as matrículas da Asex Educação em um só lugar.</p>
                    </div>
                    <Link className="asex-gradient inline-flex w-fit rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110" href="/admin/courses/create">Criar novo curso</Link>
                </div>
            </section>

            <section aria-label="Indicadores da plataforma" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <article key={card.label} className="rounded-2xl border border-asex-border bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-ink/65">{card.label}</p>
                        <strong className="mt-2 block text-4xl font-black tracking-tight text-ink">{card.value}</strong>
                        <p className="mt-2 text-sm text-ink/55">{card.detail}</p>
                    </article>
                ))}
            </section>

            <section aria-labelledby="quick-actions-title" className="mt-8">
                <p className="eyebrow text-brand-700">Acesso rápido</p>
                <h2 id="quick-actions-title" className="mt-1 text-xl font-black text-ink">Próximas ações</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Link className="group rounded-2xl border border-asex-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md" href="/admin/courses/create">
                        <p className="font-bold text-ink">Novo curso</p>
                        <p className="mt-1 text-sm leading-5 text-ink/60">Comece um curso e estruture seus módulos e aulas.</p>
                        <span className="mt-4 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Criar curso →</span>
                    </Link>
                    <Link className="group rounded-2xl border border-asex-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md" href="/admin/courses">
                        <p className="font-bold text-ink">Gerenciar cursos</p>
                        <p className="mt-1 text-sm leading-5 text-ink/60">Edite conteúdos, status e a estrutura do catálogo.</p>
                        <span className="mt-4 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Ver cursos →</span>
                    </Link>
                    <Link className="group rounded-2xl border border-asex-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md" href="/admin/courses">
                        <p className="font-bold text-ink">Gerenciar alunos</p>
                        <p className="mt-1 text-sm leading-5 text-ink/60">Acesse as matrículas e o progresso em cada curso.</p>
                        <span className="mt-4 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Ver matrículas →</span>
                    </Link>
                    <Link className="group rounded-2xl border border-asex-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md" href="/courses">
                        <p className="font-bold text-ink">Ver catálogo</p>
                        <p className="mt-1 text-sm leading-5 text-ink/60">Confira como os cursos publicados aparecem na plataforma.</p>
                        <span className="mt-4 block text-sm font-bold text-brand-700 group-hover:text-brand-900">Abrir catálogo →</span>
                    </Link>
                </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
                <article className="overflow-hidden rounded-2xl border border-asex-border bg-white">
                    <div className="flex items-center justify-between gap-4 border-b border-asex-border px-5 py-4">
                        <div>
                            <h2 className="font-black text-ink">Cursos recentes</h2>
                            <p className="mt-1 text-sm text-ink/60">Últimos cursos atualizados.</p>
                        </div>
                        <Link className="text-sm font-bold text-brand-700 hover:text-brand-900" href="/admin/courses">Todos os cursos</Link>
                    </div>
                    <div className="divide-y divide-asex-border">
                        {recentCourses.map((course) => (
                            <Link key={course.id} className="block px-5 py-4 transition hover:bg-brand-100/35" href={`/admin/courses/${course.id}/edit`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-ink">{course.title}</p>
                                        <p className="mt-1 text-sm text-ink/60">{course.lessonsCount} aulas · {course.enrollmentsCount} matrículas</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-100 text-brand-900'}`}>{course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span>
                                </div>
                            </Link>
                        ))}
                        {!recentCourses.length && <p className="px-5 py-8 text-center text-sm text-ink/60">Nenhum curso cadastrado ainda.</p>}
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-asex-border bg-white">
                    <div className="border-b border-asex-border px-5 py-4">
                        <h2 className="font-black text-ink">Matrículas recentes</h2>
                        <p className="mt-1 text-sm text-ink/60">Novos alunos no catálogo.</p>
                    </div>
                    <div className="divide-y divide-asex-border">
                        {recentEnrollments.map((enrollment) => (
                            <Link key={enrollment.id} className="block px-5 py-4 transition hover:bg-brand-100/35" href={`/admin/courses/${enrollment.course.id}/students`}>
                                <p className="font-bold text-ink">{enrollment.student.name}</p>
                                <p className="mt-1 truncate text-sm text-ink/60">{enrollment.course.title}</p>
                                <p className="mt-1 text-xs text-ink/45">{enrollment.student.email}{enrollment.enrolledAt ? ` · ${new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}` : ''}</p>
                            </Link>
                        ))}
                        {!recentEnrollments.length && <p className="px-5 py-8 text-center text-sm text-ink/60">Nenhuma matrícula registrada ainda.</p>}
                    </div>
                </article>
            </section>
        </AdminLayout>
    );
}
