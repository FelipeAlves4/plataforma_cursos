import { ReactNode } from 'react';

type Props = {
    label: string;
    value: string;
    detail: string;
    change: number | null;
    icon: ReactNode;
    isPercentageChange?: boolean;
};

export default function MetricCard({ label, value, detail, change, icon, isPercentageChange = true }: Props) {
    const hasChange = change !== null;
    const positive = (change ?? 0) >= 0;
    const changeLabel = hasChange ? `${positive ? '+' : ''}${change!.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${isPercentageChange ? '%' : ' p.p.'} vs. período anterior` : 'Sem comparação anterior';

    return <article className="admin-dashboard-metric">
        <div className="flex items-start justify-between gap-4">
            <p>{label}</p>
            <span aria-hidden="true" className="admin-dashboard-metric-icon">{icon}</span>
        </div>
        <strong>{value}</strong>
        <span className="admin-dashboard-metric-detail">{detail}</span>
        <span className={hasChange ? (positive ? 'admin-dashboard-change-positive' : 'admin-dashboard-change-negative') : 'admin-dashboard-change-neutral'}>{changeLabel}</span>
    </article>;
}
