type Props = {
    value: number;
    label?: string;
    tone?: 'default' | 'dark';
};

export default function ProgressBar({ value, label, tone = 'default' }: Props) {
    const percentage = Math.max(0, Math.min(100, value));

    return (
        <div className="space-y-2">
            <div className={`flex items-center justify-between text-sm ${tone === 'dark' ? 'text-white/65' : 'text-ink/60'}`}>
                <span>{label ?? 'Progresso'}</span>
                <span className={`font-semibold ${tone === 'dark' ? 'text-white' : 'text-ink'}`}>{percentage}%</span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${tone === 'dark' ? 'bg-white/15' : 'bg-brand-100'}`} aria-label={`${label ?? 'Progresso'}: ${percentage}%`}>
                <div className="asex-gradient h-full rounded-full transition-[width] duration-300" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
