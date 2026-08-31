import BrandLogo from '@/Components/BrandLogo';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Order = { status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'; accessUrl?: string | null; loginUrl: string };

export default function PublicCheckoutReturn({ order }: { order: Order }) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [attempts, setAttempts] = useState(0);
    const refresh = (): void => router.reload({ only: ['order'], onSuccess: (page) => setCurrentOrder((page.props as unknown as { order: Order }).order) });

    useEffect(() => {
        if (currentOrder.status !== 'PENDING' || attempts >= 20) return;
        const timer = window.setTimeout(() => { setAttempts((value) => value + 1); refresh(); }, 3000);

        return () => window.clearTimeout(timer);
    }, [attempts, currentOrder.status]);

    const content = currentOrder.status === 'PAID'
        ? ['Pagamento confirmado.', currentOrder.accessUrl ? 'Seu acesso está pronto. Crie sua senha para entrar nos cursos.' : 'Seu acesso já está associado a uma conta existente.']
        : currentOrder.status === 'FAILED'
            ? ['Não foi possível confirmar o pagamento.', 'Tente novamente ou fale com o suporte.']
            : ['Estamos confirmando seu pagamento…', attempts >= 20 ? 'A confirmação está demorando mais do que o normal.' : 'Assim que o pagamento for confirmado, seu acesso será preparado.'];

    return <main className="grid min-h-screen place-items-center bg-[#0C0A0F] px-5 py-10 text-white"><Head title="Confirmação de pagamento" /><section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#19151F] p-7 text-center shadow-2xl sm:p-10"><BrandLogo className="mx-auto h-9 w-auto" /><span aria-hidden className={`mx-auto mt-10 grid h-16 w-16 place-items-center rounded-full text-3xl ${currentOrder.status === 'PAID' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-[#9347dd]/25 text-[#dfc7ff]'}`}>{currentOrder.status === 'PAID' ? '✓' : '◌'}</span><h1 className="mt-6 text-3xl font-black tracking-tight">{content[0]}</h1><p aria-live="polite" className="mx-auto mt-3 max-w-md text-base leading-7 text-white/60">{content[1]}</p><div className="mt-8 flex flex-wrap justify-center gap-3">{currentOrder.status === 'PAID' && currentOrder.accessUrl && <a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9C48DC] px-5 py-2.5 text-sm font-bold hover:bg-[#AD5BEC]" href={currentOrder.accessUrl}>Criar minha senha</a>}{currentOrder.status === 'PAID' && !currentOrder.accessUrl && <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9C48DC] px-5 py-2.5 text-sm font-bold hover:bg-[#AD5BEC]" href={currentOrder.loginUrl}>Entrar na minha conta</Link>}{currentOrder.status === 'PENDING' && attempts >= 20 && <button className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold" onClick={refresh} type="button">Verificar novamente</button>}<a className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-bold text-[#D8B3FF] hover:text-white" href="/">Voltar ao início</a></div></section></main>;
}
