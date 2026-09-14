import { DashboardData } from '@/types/admin-dashboard';

type Props = { points: DashboardData['dropoffPoints'] };

export default function DropoffPoints({ points }: Props) {
    return <article className="admin-panel overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Pontos de abandono</h2><p>Última aula acessada por alunos sem avanço há pelo menos 14 dias.</p></div></div>
        {points.length ? <ol className="divide-y divide-white/10">{points.map((point, index) => <li className="admin-dropoff-row" key={`${point.lesson}-${index}`}><span className="admin-dropoff-rank">{index + 1}</span><div className="min-w-0 flex-1"><strong>{point.lesson}</strong><small>{point.arrived} chegaram aqui · {point.stalled} sem avançar</small></div><span className="admin-dropoff-rate">{point.rate}%<small>abandono</small></span></li>)}</ol> : <div className="admin-empty-state"><p>Ainda não há atividade suficiente para identificar pontos de abandono.</p></div>}
    </article>;
}
