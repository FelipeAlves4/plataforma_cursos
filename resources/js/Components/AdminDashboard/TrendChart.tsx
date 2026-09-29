import { GrowthPoint } from '@/types/admin-dashboard';
import { useState } from 'react';

type Props = {
    title: string;
    description: string;
    data: GrowthPoint[];
    formatValue: (value: number) => string;
    color?: 'purple' | 'emerald';
};

export default function TrendChart({ title, description, data, formatValue, color = 'purple' }: Props) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const maximum = Math.max(...data.map((point) => point.value), 1);
    const width = 620;
    const height = 220;
    const padding = 20;
    const graphHeight = height - (padding * 2);
    const pointX = (index: number) => data.length < 2 ? width / 2 : padding + (index / (data.length - 1)) * (width - (padding * 2));
    const pointY = (value: number) => height - padding - ((value / maximum) * graphHeight);
    const line = data.map((point, index) => `${pointX(index)},${pointY(point.value)}`).join(' ');
    const area = data.length ? `${padding},${height - padding} ${line} ${pointX(data.length - 1)},${height - padding}` : '';
    const selected = selectedIndex === null ? data.at(-1) : data[selectedIndex];
    const hasMovement = data.some((point) => point.value !== 0);

    return <article className="admin-panel overflow-hidden">
        <div className="admin-panel-heading">
            <div><h2>{title}</h2><p>{description}</p></div>
            {selected && <div aria-live="polite" className="admin-chart-reading"><span>{selected.label}</span><strong>{formatValue(selected.value)}</strong></div>}
        </div>
        {data.length && hasMovement ? <div className="px-3 pb-3 pt-5 sm:px-5">
            <svg aria-label={`${title}: ${data.map((point) => `${point.label}, ${formatValue(point.value)}`).join('; ')}`} className="h-56 w-full overflow-visible" role="img" viewBox={`0 0 ${width} ${height}`}>
                <defs><linearGradient id={`${color}-area`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color === 'purple' ? '#B774F1' : '#5EEAD4'} stopOpacity=".32" /><stop offset="100%" stopColor={color === 'purple' ? '#B774F1' : '#5EEAD4'} stopOpacity="0" /></linearGradient></defs>
                {[.25, .5, .75].map((linePosition) => <line key={linePosition} stroke="rgba(255,255,255,.08)" strokeDasharray="3 5" x1={padding} x2={width - padding} y1={padding + (graphHeight * linePosition)} y2={padding + (graphHeight * linePosition)} />)}
                <polygon fill={`url(#${color}-area)`} points={area} />
                <polyline fill="none" points={line} stroke={color === 'purple' ? '#C084FC' : '#5EEAD4'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                {data.map((point, index) => <circle className="cursor-pointer" cx={pointX(index)} cy={pointY(point.value)} fill="#14101F" key={point.date} r={selectedIndex === index ? 5 : 3} stroke={color === 'purple' ? '#E9D5FF' : '#99F6E4'} strokeWidth="2" tabIndex={0} onBlur={() => setSelectedIndex(null)} onFocus={() => setSelectedIndex(index)} onMouseEnter={() => setSelectedIndex(index)} />)}
            </svg>
            <div className="mt-1 flex justify-between px-2 text-xs text-[#7D7398]"><span>{data[0].label}</span><span>{data.at(-1)?.label}</span></div>
        </div> : <div className="admin-empty-state py-14"><p>Ainda não houve movimentação neste período.</p></div>}
    </article>;
}
