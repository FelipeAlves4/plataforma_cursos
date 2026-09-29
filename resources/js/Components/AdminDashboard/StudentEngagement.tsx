import { DashboardData } from '@/types/admin-dashboard';

type Props = { engagement: DashboardData['engagement'] };

const items = (engagement: DashboardData['engagement']) => [
    { label: 'Alunos ativos', value: engagement.active, description: 'Atividade nos últimos 30 dias', tone: 'emerald' },
    { label: 'Alunos inativos', value: engagement.inactive, description: 'Sem acesso recente', tone: 'slate' },
    { label: 'Ainda não iniciaram', value: engagement.notStarted, description: 'Alunos com matrícula e nenhuma aula iniciada', tone: 'amber' },
    { label: 'Possível abandono', value: engagement.atRisk, description: 'Iniciaram, não concluíram e estão há 30 dias sem atividade', tone: 'rose' },
];

export default function StudentEngagement({ engagement }: Props) {
    return <article className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Engajamento dos alunos</h2><p>Leitura da base considerando atividade em aulas.</p></div></div>
        <dl className="admin-engagement-grid">{items(engagement).map((item) => <div className={`admin-engagement-item admin-engagement-${item.tone}`} key={item.label}><dt>{item.label}</dt><dd>{item.value.toLocaleString('pt-BR')}</dd><small>{item.description}</small></div>)}</dl>
    </article>;
}
