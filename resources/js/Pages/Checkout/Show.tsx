import BrandLogo from '@/Components/BrandLogo';
import { formatCurrency } from '@/Components/CurrencyInput';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Course = {
    id: number;
    title: string;
    description?: string | null;
    estimatedDurationMinutes?: number | null;
};

type Checkout = {
    token: string;
    priceCents: number;
    program: {
        name: string;
        description?: string | null;
        audience?: string | null;
        courses: Course[];
    };
};

type TrustIconName = 'lock' | 'shield' | 'compliance' | 'access';

const trustSignals: { title: string; description: string; icon: TrustIconName }[] = [
    { title: 'Pagamento protegido', description: 'Criptografia de ponta a ponta', icon: 'lock' },
    { title: 'Antifraude', description: 'Proteção nas transações', icon: 'shield' },
    { title: 'PCI DSS', description: 'Processamento em conformidade', icon: 'compliance' },
    { title: 'Acesso automático', description: 'Após confirmação do pagamento', icon: 'access' },
];

function ArrowIcon() {
    return <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20"><path d="M3.5 10h12m-4.5-4.5L15.5 10 11 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" /></svg>;
}

function CheckIcon() {
    return <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20"><path d="m4 10 3.5 3.5L16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function LockIcon() {
    return <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 20 20"><rect height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" width="12" x="4" y="8" /><path d="M6.75 8V5.75a3.25 3.25 0 0 1 6.5 0V8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function TrustIcon({ name }: { name: TrustIconName }) {
    if (name === 'shield') {
        return <svg aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 20 20"><path d="M10 2.75 16 5v4.3c0 3.76-2.38 6.45-6 7.95-3.62-1.5-6-4.19-6-7.95V5l6-2.25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.45" /><path d="m7.2 10 1.75 1.75 3.85-4.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" /></svg>;
    }

    if (name === 'compliance') {
        return <svg aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 20 20"><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.45" width="12" x="4" y="3" /><path d="M7 7h6M7 10h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" /><path d="m11.4 13.2 1.15 1.15L15 11.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" /></svg>;
    }

    if (name === 'access') {
        return <svg aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 20 20"><circle cx="7" cy="10" r="3" stroke="currentColor" strokeWidth="1.45" /><path d="M10 10h6m-2 0v2m-2-2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" /></svg>;
    }

    return <svg aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" fill="none" viewBox="0 0 20 20"><rect height="9" rx="1.5" stroke="currentColor" strokeWidth="1.45" width="12" x="4" y="8" /><path d="M6.75 8V5.75a3.25 3.25 0 0 1 6.5 0V8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" /></svg>;
}

function ProgressMark() {
    return <span aria-hidden="true" className="checkout-progress-mark"><span /><span /><span /></span>;
}

export default function Show({ checkout }: { checkout: Checkout }) {
    const form = useForm({ name: '', email: '', phone: '' });
    const checkoutError = usePage<{ errors: { checkout?: string } }>().props.errors.checkout;
    const [isHandingOff, setIsHandingOff] = useState(false);
    const investment = formatCurrency(checkout.priceCents);

    const submit = (): void => {
        form.post(`/checkout/${checkout.token}`, {
            onStart: () => setIsHandingOff(true),
            onFinish: () => setIsHandingOff(false),
        });
    };

    return (
        <main className="checkout-shell min-h-[100dvh] overflow-x-hidden bg-[#08060D] text-[#F8F4F0]">
            <Head title={`Inscrição — ${checkout.program.name}`} />
            <div className="relative mx-auto grid min-h-[100dvh] max-w-[1440px] lg:grid-cols-[minmax(0,1.16fr)_minmax(25rem,0.84fr)]">
                <section className="relative px-5 pb-12 pt-7 sm:px-9 sm:pb-16 sm:pt-10 lg:px-14 lg:py-12 xl:px-20">
                    <BrandLogo className="h-8 w-auto sm:h-9" />

                    <div className="mt-14 max-w-[42rem] sm:mt-20 lg:mt-[clamp(3.5rem,7vh,5rem)]">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.27em] text-[#C9A7FF]">Programa ASEX</p>
                        <h1 className="mt-5 max-w-[9ch] font-serif text-[clamp(3.2rem,6vw,6.45rem)] leading-[0.88] tracking-[-0.065em] text-[#F8F4F0]">{checkout.program.name}</h1>
                        {checkout.program.description && <p className="mt-7 max-w-xl text-[1rem] leading-7 text-[#C9C2D9] sm:text-lg sm:leading-8">{checkout.program.description}</p>}
                        <div className="mt-8 border-l border-[#9347DD]/70 pl-4 lg:hidden">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.23em] text-[#9D93B8]">Investimento</p>
                            <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#F8F4F0]">{investment}</p>
                        </div>
                    </div>

                    <section aria-labelledby="courses-heading" className="mt-14 max-w-[42rem] border-t border-white/[0.1] pt-7 sm:mt-16 sm:pt-8">
                        <h2 className="font-serif text-[clamp(1.9rem,3.2vw,2.7rem)] leading-none tracking-[-0.04em] text-[#F8F4F0]" id="courses-heading">Conteúdo incluído</h2>
                        <ol className="mt-7 divide-y divide-white/[0.1]">
                            {checkout.program.courses.map((course, index) => (
                                <li className="group grid grid-cols-[2.4rem_minmax(0,1fr)] gap-3 py-5 first:pt-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-5" key={course.id}>
                                    <span aria-hidden="true" className="pt-0.5 text-sm font-semibold tabular-nums text-[#B98AF0]">{String(index + 1).padStart(2, '0')}</span>
                                    <div>
                                        <h3 className="font-serif text-lg leading-6 text-[#F8F4F0] transition-colors duration-200 group-hover:text-[#DEC3FF] sm:text-xl">{course.title}</h3>
                                        {course.description && <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#9D93B8] sm:text-[0.95rem]">{course.description}</p>}
                                    </div>
                                    {course.estimatedDurationMinutes && <p className="col-start-2 text-xs font-semibold tabular-nums text-[#837A95] sm:col-auto sm:pt-1.5">{course.estimatedDurationMinutes} min</p>}
                                </li>
                            ))}
                        </ol>
                    </section>

                    <div className="mt-7 flex max-w-xl items-start gap-3 border-t border-white/[0.1] pt-6 text-sm leading-6 text-[#B7AFC5]">
                        <span className="mt-1 text-[#C9A7FF]"><CheckIcon /></span>
                        <p>Acesso liberado após a confirmação segura do pagamento.</p>
                    </div>
                </section>

                <section className="relative flex border-t border-white/[0.08] px-5 py-10 sm:px-9 sm:py-14 lg:border-l lg:border-t-0 lg:px-12 xl:px-16">
                    <div className="my-auto w-full">
                        <div className="checkout-enrollment-panel mx-auto w-full max-w-[29rem] p-5 sm:p-8">
                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-[#C9A7FF]">Sua inscrição</p>
                            <p className="mt-3 text-sm leading-6 text-[#9D93B8]">Preencha seus dados para continuar.</p>

                            <div className="mt-7 hidden border-y border-white/[0.1] py-6 lg:block">
                                <p className="text-[0.65rem] font-bold uppercase tracking-[0.23em] text-[#9D93B8]">Investimento</p>
                                <p className="mt-2 font-serif text-5xl leading-none tracking-[-0.06em] text-[#F8F4F0]">{investment}</p>
                            </div>

                            <form className="mt-7 space-y-5" noValidate onSubmit={(event) => { event.preventDefault(); submit(); }}>
                                <div>
                                    <label className="text-sm font-semibold text-[#F8F4F0]" htmlFor="name">Nome completo</label>
                                    <input aria-describedby={form.errors.name ? 'name-error' : undefined} aria-invalid={Boolean(form.errors.name)} autoComplete="name" className="checkout-input mt-2" id="name" name="name" onChange={(event) => { form.clearErrors('name'); form.setData('name', event.target.value); }} placeholder="Digite seu nome completo" required value={form.data.name} />
                                    {form.errors.name && <p className="checkout-field-error" id="name-error" role="alert">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[#F8F4F0]" htmlFor="email">E-mail</label>
                                    <input aria-describedby={form.errors.email ? 'email-error' : undefined} aria-invalid={Boolean(form.errors.email)} autoComplete="email" className="checkout-input mt-2" id="email" name="email" onChange={(event) => { form.clearErrors('email'); form.setData('email', event.target.value); }} placeholder="voce@exemplo.com" required type="email" value={form.data.email} />
                                    {form.errors.email && <p className="checkout-field-error" id="email-error" role="alert">{form.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[#F8F4F0]" htmlFor="phone">WhatsApp</label>
                                    <input aria-describedby={form.errors.phone ? 'phone-error' : undefined} aria-invalid={Boolean(form.errors.phone)} autoComplete="tel" className="checkout-input mt-2" id="phone" inputMode="tel" name="phone" onChange={(event) => { form.clearErrors('phone'); form.setData('phone', event.target.value); }} placeholder="(11) 99999-9999" required type="tel" value={form.data.phone} />
                                    {form.errors.phone && <p className="checkout-field-error" id="phone-error" role="alert">{form.errors.phone}</p>}
                                </div>

                                {checkoutError && <div aria-live="assertive" className="checkout-request-error" role="alert"><p>Não foi possível iniciar o pagamento agora.</p><span>Seus dados foram preservados. Tente novamente.</span></div>}

                                <button className="checkout-primary-button" disabled={form.processing} type="submit">
                                    <span>{form.processing ? 'Preparando pagamento…' : 'Continuar para o pagamento'}</span>
                                    <ArrowIcon />
                                </button>
                            </form>

                            <div className="mt-6">
                                <ul aria-label="Segurança e processamento do pagamento" className="checkout-trust-grid">
                                    {trustSignals.map((signal) => (
                                        <li className="checkout-trust-item" key={signal.title}>
                                            <span className="checkout-trust-icon"><TrustIcon name={signal.icon} /></span>
                                            <p className="checkout-trust-title">{signal.title}</p>
                                            <p className="checkout-trust-description">{signal.description}</p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5 text-center">
                                    <p className="flex items-center justify-center gap-2 text-xs leading-5 text-[#C8C0D5]"><LockIcon />Pagamento processado com segurança pela InfinitePay</p>
                                    <p className="mt-1.5 text-[0.7rem] leading-5 text-[#837A95]">Os dados do pagamento são processados no ambiente da InfinitePay.</p>
                                </div>

                                <p className="mt-5 border-t border-white/[0.08] pt-5 text-center text-xs leading-5 text-[#837A95]">Ao continuar, você concorda com a <a className="checkout-legal-link" href="/#privacidade">Política de Privacidade</a> e os <a className="checkout-legal-link" href="/#termos">Termos de Uso</a>.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {isHandingOff && <div aria-live="polite" aria-modal="true" className="checkout-handoff" role="dialog">
                <div className="checkout-handoff-panel">
                    <BrandLogo className="h-8 w-auto" />
                    <div className="mt-12 grid h-11 w-11 place-items-center rounded-full border border-[#B98AF0]/35 bg-[#6429AA]/15 text-[#E4D2FF]"><CheckIcon /></div>
                    <p className="mt-5 text-sm font-semibold text-[#F8F4F0]">Dados confirmados</p>
                    <h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.05em] text-[#F8F4F0]">Preparando seu pagamento seguro…</h2>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-[#B7AFC5]">Conectando você ao ambiente de pagamento da InfinitePay.</p>
                    <div className="mt-8"><ProgressMark /></div>
                    <p className="mt-7 flex items-center gap-2 text-xs text-[#9D93B8]"><LockIcon />Pagamento processado com segurança pela InfinitePay</p>
                </div>
            </div>}
        </main>
    );
}
