import AttentionTable from '@/Components/AdminDashboard/AttentionTable';
import CoursePerformanceTable from '@/Components/AdminDashboard/CoursePerformanceTable';
import DashboardLoading from '@/Components/AdminDashboard/DashboardLoading';
import DropoffPoints from '@/Components/AdminDashboard/DropoffPoints';
import MetricCard from '@/Components/AdminDashboard/MetricCard';
import RecentActivity from '@/Components/AdminDashboard/RecentActivity';
import StudentEngagement from '@/Components/AdminDashboard/StudentEngagement';
import TrendChart from '@/Components/AdminDashboard/TrendChart';
import AdminLayout from '@/Layouts/AdminLayout';
import { DashboardData, Period } from '@/types/admin-dashboard';
import { Head, Link, router } from '@inertiajs/react';
import { ChangeEvent, ReactNode, useState } from 'react';

type Props = { dashboard: DashboardData };

const periods: { value: Period; label: string }[] = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: 'year', label: 'Este ano' },
    { value: 'all', label: 'Todo o período' },
];

function Icon({ children }: { children: ReactNode }) {
    return <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">{children}</svg>;
}

const formatCurrency = (amountCents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountCents / 100);
const formatNumber = (value: number) => value.toLocaleString('pt-BR');

export default function Dashboard({ dashboard }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    const changePeriod = (event: ChangeEvent<HTMLSelectElement>) => {
        setRequestError(null);
        router.get('/admin', { period: event.target.value }, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onStart: () => setIsLoading(true),
            onError: () => setRequestError('Não foi possível atualizar os indicadores. Tente novamente.'),
            onFinish: () => setIsLoading(false),
        });
    };

    return <AdminLayout>
        <Head title="Dashboard administrativo" />
        <section className="admin-page-header">
            <div><p className="admin-eyebrow">ASEX Educação · Administração</p><h1>Dashboard</h1><p>Visão geral da operação da ASEX Educação</p></div>
            <div className="flex flex-wrap items-center gap-3">
                <label className="admin-period-select"><span>Período</span><select aria-label="Filtrar período do dashboard" value={dashboard.period} onChange={changePeriod}>{periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}</select></label>
                <Link className="admin-secondary-button" href="/admin/students">Ver alunos</Link><Link className="admin-primary-button" href="/admin/courses/create">Novo curso</Link>
            </div>
        </section>

        {requestError && <div className="admin-dashboard-error" role="alert"><span>{requestError}</span><button type="button" onClick={() => router.reload()}>Tentar novamente</button></div>}
        {isLoading ? <DashboardLoading /> : <>
        <section aria-label="Indicadores principais" className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <MetricCard change={dashboard.summary.students.change} detail={`+${formatNumber(dashboard.summary.students.new)} no período`} icon={<Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6m3-3h-6" /></Icon>} label="Alunos" value={formatNumber(dashboard.summary.students.total)} />
            <MetricCard change={dashboard.summary.activeStudents.change} detail={`${dashboard.summary.activeStudents.percentage.toLocaleString('pt-BR')}% da base ativa`} icon={<Icon><path d="M20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>} label="Alunos ativos" value={formatNumber(dashboard.summary.activeStudents.total)} />
            <MetricCard change={dashboard.summary.revenue.change} detail={`${formatNumber(dashboard.summary.revenue.sales)} vendas confirmadas`} icon={<Icon><path d="M4 4h16v4H4z" /><path d="M6 8v12h12V8M9 13h6" /></Icon>} label="Faturamento" value={formatCurrency(dashboard.summary.revenue.amountCents)} />
            <MetricCard change={dashboard.summary.completionRate.change} detail="Média em matrículas com aulas" icon={<Icon><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-5" /></Icon>} isPercentageChange={false} label="Taxa média de conclusão" value={`${dashboard.summary.completionRate.percentage.toLocaleString('pt-BR')}%`} />
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
            <TrendChart data={dashboard.studentsGrowth} description="Entradas de novos alunos no período selecionado." formatValue={formatNumber} title="Novos alunos" />
            <TrendChart color="emerald" data={dashboard.revenueGrowth} description="Somente pagamentos confirmados via checkout." formatValue={formatCurrency} title="Faturamento" />
        </section>

        <section className="mt-6"><CoursePerformanceTable courses={dashboard.coursePerformance} /></section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
            <StudentEngagement engagement={dashboard.engagement} />
            <DropoffPoints points={dashboard.dropoffPoints} />
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
            <AttentionTable students={dashboard.atRiskStudents} />
            <RecentActivity activity={dashboard.recentActivity} />
        </section>
        </>}
    </AdminLayout>;
}
