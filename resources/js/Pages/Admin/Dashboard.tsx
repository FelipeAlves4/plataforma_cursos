import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

type Props = {
    metrics: { students: number; courses: number; publishedCourses: number; draftCourses: number; lessons: number; enrollments: number };
    recentCourses: { id: number; title: string; status: 'DRAFT' | 'PUBLISHED'; lessonsCount: number; enrollmentsCount: number }[];
    recentEnrollments: { id: number; enrolledAt: string | null; course: { id: number; title: string }; student: { name: string; email: string } }[];
};

function Status({ status }: { status: 'DRAFT' | 'PUBLISHED' }) {
    return <span className={status === 'PUBLISHED' ? 'admin-status admin-status-published' : 'admin-status admin-status-draft'}>{status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</span>;
}

export default function Dashboard({ metrics, recentCourses, recentEnrollments }: Props) {
    const cards = [
        { label: 'Alunos', value: metrics.students, detail: 'Contas de estudantes' },
        { label: 'Cursos', value: metrics.courses, detail: 'No catálogo administrativo' },
        { label: 'Publicados', value: metrics.publishedCourses, detail: 'Disponíveis aos matriculados' },
        { label: 'Rascunhos', value: metrics.draftCourses, detail: 'Em preparação' },
        { label: 'Aulas', value: metrics.lessons, detail: 'Conteúdos cadastrados' },
        { label: 'Matrículas', value: metrics.enrollments, detail: 'Vínculos ativos' },
    ];

    return <AdminLayout>
        <Head title="Administração" />
        <section className="admin-page-header">
            <div><p className="admin-eyebrow">Administração</p><h1>Visão geral</h1><p>Tenha uma leitura objetiva do catálogo, conteúdo e matrículas.</p></div>
            <Link className="admin-primary-button" href="/admin/courses/create">Novo curso</Link>
        </section>
        <section aria-label="Indicadores da plataforma" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => <article className="admin-metric-card" key={card.label}><p>{card.label}</p><strong>{card.value}</strong><span>{card.detail}</span></article>)}
        </section>
        <section className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
            <article className="admin-panel overflow-hidden">
                <div className="admin-panel-heading"><div><h2>Cursos recentes</h2><p>Últimos cursos atualizados.</p></div><Link className="admin-text-link" href="/admin/courses">Ver cursos</Link></div>
                {recentCourses.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[650px]"><thead><tr><th>Curso</th><th>Status</th><th>Aulas</th><th>Matrículas</th></tr></thead><tbody>{recentCourses.map((course) => <tr key={course.id}><td><Link className="admin-table-link" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link></td><td><Status status={course.status} /></td><td>{course.lessonsCount}</td><td><Link className="admin-text-link" href={`/admin/courses/${course.id}/students`}>{course.enrollmentsCount}</Link></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><p>Nenhum curso cadastrado ainda.</p><Link className="admin-text-link" href="/admin/courses/create">Criar o primeiro curso</Link></div>}
            </article>
            <article className="admin-panel overflow-hidden">
                <div className="admin-panel-heading"><div><h2>Matrículas recentes</h2><p>Atividade real da plataforma.</p></div></div>
                {recentEnrollments.length ? <div className="divide-y divide-white/10">{recentEnrollments.map((enrollment) => <Link className="admin-activity" href={`/admin/courses/${enrollment.course.id}/students`} key={enrollment.id}><span className="admin-avatar">{enrollment.student.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0"><strong>{enrollment.student.name}</strong><small>{enrollment.course.title}</small><small>{enrollment.student.email}{enrollment.enrolledAt ? ` · ${new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}` : ''}</small></span></Link>)}</div> : <div className="admin-empty-state"><p>Nenhuma matrícula registrada ainda.</p></div>}
            </article>
        </section>
    </AdminLayout>;
}
