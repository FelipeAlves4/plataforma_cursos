import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Order = { status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'; paidAt?: string | null };

export default function InfinitePayReturn({ order }: { order: Order }) {
    const [status, setStatus] = useState(order.status);
    const [attempts, setAttempts] = useState(0);
    const refresh = (): void => router.reload({ only: ['order'], onSuccess: (page) => setStatus((page.props as unknown as { order: Order }).order.status) });

    useEffect(() => {
        if (status !== 'PENDING' || attempts >= 20) return;
        const timer = window.setTimeout(() => { setAttempts((value) => value + 1); refresh(); }, 3000);
        return () => window.clearTimeout(timer);
    }, [attempts, status]);

    const content = status === 'PAID' ? ['Pagamento confirmado.', 'Seu acesso foi liberado.'] : status === 'FAILED' ? ['Não foi possível confirmar o pagamento.', 'Tente novamente ou entre em contato com o suporte.'] : ['Estamos confirmando seu pagamento…', attempts >= 20 ? 'A confirmação está demorando mais do que o normal.' : 'Assim que o pagamento for confirmado, seus cursos serão liberados.'];
    return <StudentLayout><Head title="Confirmação de pagamento" /><section className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-[#15101b] p-8 text-center shadow-2xl sm:mt-20 sm:p-12"><span aria-hidden className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${status === 'PAID' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-[#9347dd]/25 text-[#dfc7ff]'}`}>{status === 'PAID' ? '✓' : '◌'}</span><h1 className="mt-6 text-3xl font-black tracking-tight text-white">{content[0]}</h1><p aria-live="polite" className="mt-3 text-base leading-7 text-white/60">{content[1]}</p><div className="mt-8 flex flex-wrap justify-center gap-3">{status === 'PAID' && <Link className="asex-gradient inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold text-white" href="/my-courses">Ir para meus cursos</Link>}{status === 'PENDING' && attempts >= 20 && <button className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold text-white" onClick={refresh} type="button">Verificar novamente</button>}<Link className="text-sm font-bold text-[#c28aff]" href="/dashboard">Voltar ao início</Link></div></section></StudentLayout>;
}
