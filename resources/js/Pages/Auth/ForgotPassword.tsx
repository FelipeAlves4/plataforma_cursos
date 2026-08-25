import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const submit: FormEventHandler = (event) => { event.preventDefault(); post(route('password.email')); };

    return <GuestLayout><Head title="Recuperar senha" /><header className="mb-7"><p className="eyebrow text-brand-700">Acesso à plataforma</p><h1 className="mt-2 text-2xl font-black text-ink">Recupere sua senha.</h1><p className="mt-2 text-sm leading-6 text-ink/60">Informe seu e-mail para receber as instruções de redefinição.</p></header>{status && <div className="mb-4 rounded-lg bg-brand-100 p-3 text-sm font-medium text-asex-success">{status}</div>}<form onSubmit={submit}><InputLabel htmlFor="email" value="E-mail" /><TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" autoComplete="email" isFocused onChange={(event) => setData('email', event.target.value)} required /><InputError message={errors.email} className="mt-2" /><div className="mt-6 flex justify-end"><PrimaryButton disabled={processing}>{processing ? 'Enviando…' : 'Enviar instruções'}</PrimaryButton></div></form></GuestLayout>;
}
