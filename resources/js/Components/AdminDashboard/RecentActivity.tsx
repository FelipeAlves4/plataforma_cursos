import { DashboardData } from '@/types/admin-dashboard';

type Props = { activity: DashboardData['recentActivity'] };

const icons: Record<DashboardData['recentActivity'][number]['type'], string> = { enrollment: '↗', started: '▶', completion: '✓', sale: 'R$', student: '+' };

function relativeDate(value: string): string {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes} min`;
    if (minutes < 1_440) return `há ${Math.floor(minutes / 60)} h`;
    if (minutes < 2_880) return 'ontem';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(value));
}

export default function RecentActivity({ activity }: Props) {
    return <article className="admin-panel overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Atividade recente</h2><p>Eventos registrados na plataforma.</p></div></div>
        {activity.length ? <ul className="divide-y divide-white/10">{activity.map((item) => <li className="admin-recent-activity" key={item.id}><span aria-hidden="true" className={`admin-recent-icon admin-recent-${item.type}`}>{icons[item.type]}</span><div className="min-w-0 flex-1"><strong>{item.title}</strong><small>{relativeDate(item.occurredAt)}</small></div></li>)}</ul> : <div className="admin-empty-state"><p>Ainda não há eventos para exibir.</p></div>}
    </article>;
}
