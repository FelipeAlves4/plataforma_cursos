import BrandLogo from '@/Components/BrandLogo';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Order = {
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
    accessUrl?: string | null;
    customerName?: string | null;
    loginUrl: string;
};

function CheckIcon() {
    return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20"><path d="m4 10 3.5 3.5L16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function PendingMark() {
    return <span aria-hidden="true" className="checkout-progress-mark"><span /><span /><span /></span>;
}

export default function PublicCheckoutReturn({ order }: { order: Order }) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [attempts, setAttempts] = useState(0);
    const refresh = (): void => router.reload({ only: ['order'], onSuccess: (page) => setCurrentOrder((page.props as unknown as { order: Order }).order) });

    useEffect(() => {
        if (currentOrder.status !== 'PENDING' || attempts >= 20) {
            return;
        }

        const timer = window.setTimeout(() => {
            setAttempts((value) => value + 1);
            refresh();
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [attempts, currentOrder.status]);

    const isPaid = currentOrder.status === 'PAID';
    const isPending = currentOrder.status === 'PENDING';
    const title = isPaid
        ? `Tudo certo${currentOrder.customerName ? `, ${currentOrder.customerName}` : ''}.`
        : isPending
            ? 'Estamos confirmando seu pagamento.'
            : 'Não foi possível confirmar o pagamento.';
    const description = isPaid
        ? currentOrder.accessUrl
            ? 'Seu acesso ao programa está pronto. As instruções também foram enviadas ao e-mail informado.'
            : 'Seu acesso já está associado a uma conta existente.'
        : isPending
            ? attempts >= 20
                ? 'A confirmação está demorando mais do que o normal. Você pode verificar novamente.'
                : 'Assim que o pagamento for confirmado, seu acesso será preparado.'
            : 'Tente novamente ou fale com o suporte se o problema continuar.';

    return (
        <main className="checkout-shell grid min-h-[100dvh] place-items-center px-5 py-10 text-[#F8F4F0] sm:px-8">
            <Head title="Confirmação de pagamento" />
            <section aria-live="polite" className="checkout-enrollment-panel w-full max-w-xl p-7 text-center sm:p-10">
                <BrandLogo className="mx-auto h-8 w-auto sm:h-9" />
                <div className={`mx-auto mt-12 grid h-14 w-14 place-items-center rounded-full border ${isPaid ? 'border-emerald-300/35 bg-emerald-400/10 text-emerald-200' : 'border-[#B98AF0]/35 bg-[#6429AA]/15 text-[#E4D2FF]'}`}>
                    {isPaid ? <CheckIcon /> : <PendingMark />}
                </div>
                <h1 className="mx-auto mt-6 max-w-lg font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] tracking-[-0.05em]">{title}</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#B7AFC5] sm:text-base sm:leading-7">{description}</p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                    {isPaid && currentOrder.accessUrl && <a className="checkout-primary-button w-auto" href={currentOrder.accessUrl}>Criar minha senha</a>}
                    {isPaid && !currentOrder.accessUrl && <Link className="checkout-primary-button w-auto" href={currentOrder.loginUrl}>Entrar na minha conta</Link>}
                    {isPending && attempts >= 20 && <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-bold text-[#E4D2FF] transition hover:border-[#B98AF0]/50 hover:bg-white/[0.04]" onClick={refresh} type="button">Verificar novamente</button>}
                    <a className="checkout-legal-link inline-flex items-center px-3 py-3 text-sm font-semibold" href="/">Voltar ao início</a>
                </div>
            </section>
        </main>
    );
}
