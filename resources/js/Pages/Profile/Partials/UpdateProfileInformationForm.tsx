import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { PageProps } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function UpdateProfileInformation({ className = '' }: { mustVerifyEmail: boolean; status?: string; className?: string }) {
    const user = usePage<PageProps>().props.auth.user;
    const form = useForm({ name: user.name, email: user.email, phone: user.phone ?? '', job_title: user.job_title ?? '', company: user.company ?? '', business_segment: user.business_segment ?? '', city: user.city ?? '', state: user.state ?? '' });
    const field = (key: keyof typeof form.data, label: string, type = 'text') => <label className="grid gap-2 text-sm font-semibold">{label}<input type={type} value={form.data[key]} onChange={event => form.setData(key, event.target.value)} className="rounded-lg border-ink/15" /><InputError message={form.errors[key]} /></label>;
    const submit = (event: FormEvent) => { event.preventDefault(); form.patch(route('profile.update')); };
    return <section className={className}><header><p className="eyebrow text-brand-700">Meu perfil</p><h2 className="mt-2 text-2xl font-black">Dados profissionais</h2><p className="mt-2 text-sm text-ink/65">Complete seus dados para personalizar sua experiência.</p></header><form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">{field('name', 'Nome completo')}{field('email', 'E-mail', 'email')}{field('phone', 'Telefone')}{field('job_title', 'Cargo ou função')}{field('company', 'Empresa')}{field('business_segment', 'Segmento do estabelecimento')}{field('city', 'Cidade')}{field('state', 'Estado (UF)')}<div className="sm:col-span-2 flex items-center gap-4"><PrimaryButton disabled={form.processing}>Salvar alterações</PrimaryButton>{form.recentlySuccessful && <span className="text-sm font-semibold text-brand-700">Dados salvos.</span>}</div></form></section>;
}
