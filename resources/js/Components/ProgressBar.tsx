type Props = {
    value: number;
    label?: string;
};

export default function ProgressBar({ value, label }: Props) {
    const percentage = Math.max(0, Math.min(100, value));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{label ?? 'Progresso'}</span>
                <span className="font-semibold text-slate-700">{percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-label={`${label ?? 'Progresso'}: ${percentage}%`}>
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
