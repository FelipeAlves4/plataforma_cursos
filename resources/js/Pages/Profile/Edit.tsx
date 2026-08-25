import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
export default function Edit({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) { return <AppLayout><Head title="Meu perfil" /><div className="mx-auto max-w-3xl"><UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="rounded-2xl bg-white p-7 shadow-sm" /><div className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><UpdatePasswordForm className="max-w-xl" /></div><div className="mt-6 rounded-2xl bg-white p-7 shadow-sm"><DeleteUserForm className="max-w-xl" /></div></div></AppLayout>; }
