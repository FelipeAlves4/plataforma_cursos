import BrandLogo from '@/Components/BrandLogo';
import { formatCurrency } from '@/Components/CurrencyInput';
import { Head, useForm, usePage } from '@inertiajs/react';

type Course = { id: number; title: string; description?: string | null; estimatedDurationMinutes?: number | null };
type Checkout = { token: string; priceCents: number; program: { name: string; description?: string | null; audience?: string | null; courses: Course[] } };

export default function Show({ checkout }: { checkout: Checkout }) {
    const form = useForm({ name: '', email: '', phone: '' });
    const checkoutError = usePage<{ errors: { checkout?: string } }>().props.errors.checkout;

    const submit = (): void => form.post(`/checkout/${checkout.token}`);

    return <main className="min-h-screen bg-[#0C0A0F] text-[#F6F2FA]">
        <Head title={`Inscrição — ${checkout.program.name}`} />
        <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.1fr_0.9fr]">
            <section className="border-b border-white/10 px-5 py-7 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12 xl:px-20">
                <BrandLogo className="h-9 w-auto" />
                <div className="mt-12 max-w-2xl sm:mt-16">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#CDA3FF]">Programa online</p>
                    <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl xl:text-6xl">{checkout.program.name}</h1>
                    {checkout.program.description && <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">{checkout.program.description}</p>}
                    {checkout.program.audience && <p className="mt-5 inline-flex rounded-full border border-[#B56AF7]/30 bg-[#7B32B6]/15 px-3 py-1.5 text-sm font-semibold text-[#E6CFFF]">Para {checkout.program.audience}</p>}
                </div>
                <section aria-labelledby="courses-heading" className="mt-11 max-w-2xl border-t border-white/10 pt-7 sm:mt-14">
                    <div className="flex items-baseline justify-between gap-4"><h2 className="text-lg font-extrabold text-white" id="courses-heading">Conteúdo incluído</h2><span className="text-sm text-white/45">{checkout.program.courses.length} {checkout.program.courses.length === 1 ? 'curso' : 'cursos'}</span></div>
                    <ol className="mt-5 space-y-3">{checkout.program.courses.map((course, index) => <li className="flex gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4" key={course.id}><span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#9B4DDE]/20 text-xs font-black text-[#EBCFFF]">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-bold text-white">{course.title}</h3>{course.description && <p className="mt-1 text-sm leading-6 text-white/55">{course.description}</p>}{course.estimatedDurationMinutes && <p className="mt-2 text-xs font-semibold text-white/40">{course.estimatedDurationMinutes} min de conteúdo</p>}</div></li>)}</ol>
                </section>
                <div className="mt-10 flex items-start gap-3 text-sm leading-6 text-white/50"><span aria-hidden className="mt-0.5 text-[#CDA3FF]">✓</span><p>Acesso liberado somente após a confirmação segura do pagamento.</p></div>
            </section>
            <section className="flex items-center bg-[#121017] px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
                <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#19151F] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#CDA3FF]">Sua inscrição</p>
                    <div className="mt-5 border-y border-white/10 py-5"><p className="text-sm text-white/55">Investimento à vista</p><p className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">{formatCurrency(checkout.priceCents)}</p></div>
                    <form className="mt-6 space-y-4" noValidate onSubmit={(event) => { event.preventDefault(); submit(); }}>
                        <div><label className="text-sm font-bold text-white" htmlFor="name">Nome completo</label><input autoComplete="name" className="mt-2 w-full rounded-lg border border-white/15 bg-[#100D15] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#C082FF] focus:ring-2 focus:ring-[#A74CE7]/35" id="name" name="name" onChange={(event) => form.setData('name', event.target.value)} placeholder="Como você quer ser chamado" value={form.data.name} />{form.errors.name && <p className="mt-1.5 text-sm text-rose-300" role="alert">{form.errors.name}</p>}</div>
                        <div><label className="text-sm font-bold text-white" htmlFor="email">E-mail</label><input autoComplete="email" className="mt-2 w-full rounded-lg border border-white/15 bg-[#100D15] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#C082FF] focus:ring-2 focus:ring-[#A74CE7]/35" id="email" name="email" onChange={(event) => form.setData('email', event.target.value)} placeholder="voce@exemplo.com" type="email" value={form.data.email} />{form.errors.email && <p className="mt-1.5 text-sm text-rose-300" role="alert">{form.errors.email}</p>}</div>
                        <div><label className="text-sm font-bold text-white" htmlFor="phone">WhatsApp</label><input autoComplete="tel" className="mt-2 w-full rounded-lg border border-white/15 bg-[#100D15] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#C082FF] focus:ring-2 focus:ring-[#A74CE7]/35" id="phone" inputMode="tel" name="phone" onChange={(event) => form.setData('phone', event.target.value)} placeholder="(11) 99999-9999" type="tel" value={form.data.phone} />{form.errors.phone && <p className="mt-1.5 text-sm text-rose-300" role="alert">{form.errors.phone}</p>}</div>
                        {checkoutError && <p className="rounded-lg border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100" role="alert">{checkoutError}</p>}
                        <button className="mt-2 flex min-h-13 w-full items-center justify-center rounded-lg bg-[#9C48DC] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#AD5BEC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#19151F] disabled:cursor-wait disabled:opacity-65" disabled={form.processing} type="submit">{form.processing ? 'Preparando pagamento…' : 'Continuar para o pagamento'} <span aria-hidden className="ml-2">→</span></button>
                    </form>
                    <p className="mt-5 text-center text-xs leading-5 text-white/45">Pagamento processado em ambiente seguro pela InfinitePay.</p>
                    <p className="mt-4 text-center text-xs leading-5 text-white/40">Ao continuar, você concorda com a <a className="text-[#D8B3FF] underline underline-offset-2 hover:text-white" href="/#privacidade">Política de Privacidade</a> e os <a className="text-[#D8B3FF] underline underline-offset-2 hover:text-white" href="/#termos">Termos de Uso</a>.</p>
                </div>
            </section>
        </div>
    </main>;
}
