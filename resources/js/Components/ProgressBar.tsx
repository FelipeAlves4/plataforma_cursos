type Props = {
    value: number;
    label?: string;
};

export default function ProgressBar({ value, label }: Props) {
    const percentage = Math.max(0, Math.min(100, value));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-ink/60">
                <span>{label ?? 'Progresso'}</span>
                <span className="font-semibold text-ink">{percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-100" aria-label={`${label ?? 'Progresso'}: ${percentage}%`}>
                <div className="asex-gradient h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
