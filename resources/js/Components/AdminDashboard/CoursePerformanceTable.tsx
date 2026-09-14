import { DashboardData } from '@/types/admin-dashboard';
import { Link } from '@inertiajs/react';

type Props = { courses: DashboardData['coursePerformance'] };

export default function CoursePerformanceTable({ courses }: Props) {
    return <article className="admin-panel overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Performance dos cursos</h2><p>Conclusão e avanço consolidados por matrícula.</p></div><Link className="admin-text-link" href="/admin/courses">Ver todos</Link></div>
        {courses.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[720px]"><thead><tr><th>Curso</th><th>Alunos</th><th>Iniciaram</th><th>Concluíram</th><th>Conclusão</th><th>Progresso</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id}><td><Link className="admin-table-link" href={`/admin/courses/${course.id}/edit`}>{course.title}</Link></td><td>{course.students}</td><td>{course.started}</td><td>{course.completed}</td><td><span className="admin-percent-value">{course.completionRate}%</span></td><td><span className="admin-progress-inline"><i style={{ width: `${course.averageProgress}%` }} />{course.averageProgress}%</span></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><p>Nenhum curso possui dados de progresso ainda.</p></div>}
    </article>;
}
