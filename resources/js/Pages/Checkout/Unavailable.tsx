import BrandLogo from '@/Components/BrandLogo';
import { Head, Link } from '@inertiajs/react';

function LinkIcon() {
    return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20"><path d="M7.5 12.5 12.5 7.5m-5.9 7.1-1.2 1.2a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0m5.9-3.2 1.2-1.2a3 3 0 0 0-4.2-4.2l-3 3a3 3 0 0 0 0 4.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

export default function Unavailable() {
    return (
        <main className="checkout-shell grid min-h-[100dvh] place-items-center px-5 py-10 text-[#F8F4F0] sm:px-8">
            <Head title="Link de inscrição indisponível" />
            <section className="checkout-enrollment-panel w-full max-w-xl p-7 text-center sm:p-10">
                <BrandLogo className="mx-auto h-8 w-auto sm:h-9" />
                <div className="mx-auto mt-12 grid h-14 w-14 place-items-center rounded-full border border-[#B98AF0]/35 bg-[#6429AA]/15 text-[#E4D2FF]"><LinkIcon /></div>
                <h1 className="mx-auto mt-6 max-w-md font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] tracking-[-0.05em]">Este link de inscrição não está disponível.</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#B7AFC5] sm:text-base sm:leading-7">Ele pode ter expirado ou estar inativo. Se você recebeu este link recentemente, fale com a equipe responsável.</p>
                <Link className="checkout-primary-button mx-auto mt-9 w-auto" href="/">Voltar ao início</Link>
            </section>
        </main>
    );
}
