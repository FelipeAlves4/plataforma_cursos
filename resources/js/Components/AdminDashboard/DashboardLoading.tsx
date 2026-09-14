export default function DashboardLoading() {
    return <div aria-busy="true" aria-label="Atualizando dados do dashboard" className="mt-8 animate-pulse space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-44 rounded-2xl border border-white/10 bg-[#14101F] p-5" key={index}><div className="h-4 w-24 rounded bg-white/10" /><div className="mt-7 h-9 w-32 rounded bg-white/10" /><div className="mt-5 h-3 w-40 rounded bg-white/10" /></div>)}</div>
        <div className="grid gap-6 2xl:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div className="h-80 rounded-2xl border border-white/10 bg-[#14101F]" key={index} />)}</div>
        <div className="h-72 rounded-2xl border border-white/10 bg-[#14101F]" />
    </div>;
}
