import AppLayout from '@/Layouts/AppLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

type Props = { mustVerifyEmail: boolean; status?: string };

function Avatar({ name, avatarPath }: { name: string; avatarPath?: string | null }) {
    const [imageFailed, setImageFailed] = useState(false);
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
    const source = avatarPath ? (/^https?:\/\//.test(avatarPath) ? avatarPath : `/storage/${avatarPath}`) : null;

    return <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#9347dd] bg-[linear-gradient(135deg,#2b0870,#6429aa)] text-xl font-black text-white shadow-[0_0_0_5px_rgba(147,71,221,0.12)] sm:h-24 sm:w-24 sm:text-2xl">{source && !imageFailed ? <img alt={`Foto de perfil de ${name}`} className="h-full w-full object-cover" onError={() => setImageFailed(true)} src={source} /> : initials}</div>;
}

function StudentProfile({ mustVerifyEmail, status }: Props) {
    const user = usePage<PageProps>().props.auth.user;
    const professionalDetails = [user.job_title, user.company].filter(Boolean).join(' · ');

    return <StudentLayout><Head title="Meu perfil" />
        <section className="relative overflow-hidden border-b border-white/[0.08] pb-10 sm:pb-14"><span aria-hidden className="absolute right-0 top-0 h-64 w-64 rotate-45 border border-[#9347dd]/35" /><div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c28aff]">Conta</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Meu perfil</h1><p className="mt-4 max-w-xl text-base leading-7 text-white/60 sm:text-lg">Gerencie suas informações pessoais e profissionais.</p></div></section>
        <section className="mt-8 flex flex-col gap-5 border border-white/[0.1] bg-[#15101b] p-6 sm:mt-10 sm:flex-row sm:items-center sm:p-8"><Avatar avatarPath={user.avatar_path} name={user.name} /><div className="min-w-0"><h2 className="truncate text-2xl font-black tracking-tight text-white">{user.name}</h2><p className="mt-1 truncate text-sm text-white/55 sm:text-base">{user.email}</p>{professionalDetails && <p className="mt-3 text-sm font-medium text-[#d8bdff]">{professionalDetails}</p>}</div></section>
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,.65fr)]"><UpdateProfileInformationForm className="border border-white/[0.1] bg-[#15101b] p-6 sm:p-8" mustVerifyEmail={mustVerifyEmail} status={status} variant="student" /><div className="space-y-6"><UpdatePasswordForm className="border border-white/[0.1] bg-[#15101b] p-6 sm:p-8" variant="student" /><DeleteUserForm className="border border-rose-400/20 bg-[#15101b] p-6 sm:p-8" variant="student" /></div></div>
    </StudentLayout>;
}

export default function Edit({ mustVerifyEmail, status }: Props) {
    const user = usePage<PageProps>().props.auth.user;

    if (user.role === 'STUDENT') {
        return <StudentProfile mustVerifyEmail={mustVerifyEmail} status={status} />;
    }

    return <AppLayout><Head title="Meu perfil" /><div className="mx-auto max-w-3xl"><UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="rounded-2xl bg-white p-7 shadow-sm" /><div className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><UpdatePasswordForm className="max-w-xl" /></div><div className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><DeleteUserForm className="max-w-xl" /></div></div></AppLayout>;
}
