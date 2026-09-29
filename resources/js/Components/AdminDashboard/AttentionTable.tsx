import { DashboardData } from '@/types/admin-dashboard';
import { Link } from '@inertiajs/react';

type Props = { students: DashboardData['atRiskStudents'] };

function relativeDate(value: string | null): string {
    if (!value) return 'Sem atividade';

    const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Há 1 dia';

    return `Há ${days} dias`;
}

export default function AttentionTable({ students }: Props) {
    return <article className="admin-panel overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Alunos que precisam de atenção</h2><p>Priorize intervenções antes que o engajamento caia.</p></div></div>
        {students.length ? <div className="overflow-x-auto"><table className="admin-table min-w-[760px]"><thead><tr><th>Aluno</th><th>Curso</th><th>Progresso</th><th>Última atividade</th><th>Status</th><th><span className="sr-only">Ação</span></th></tr></thead><tbody>{students.map((student) => <tr key={`${student.userId}-${student.courseId}`}><td className="font-bold text-[#F8F7FB]">{student.name}</td><td>{student.course}</td><td>{student.progress}%</td><td>{relativeDate(student.lastActivityAt)}</td><td><span className={`admin-attention-status admin-attention-${student.status === 'Risco de abandono' ? 'risk' : student.status === 'Baixo progresso' ? 'low' : 'neutral'}`}>{student.status}</span></td><td><Link className="admin-text-link whitespace-nowrap" href={`/admin/students/${student.userId}`}>Ver aluno</Link></td></tr>)}</tbody></table></div> : <div className="admin-empty-state"><p>Nenhum aluno precisa de atenção neste momento.</p></div>}
    </article>;
}
