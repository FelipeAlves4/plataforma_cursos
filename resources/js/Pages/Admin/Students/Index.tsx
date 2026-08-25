import ProgressBar from '@/Components/ProgressBar';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

type Props = { course: { title: string }; students: Array<{ id: number; name: string; email: string; enrolledAt?: string | null; progress: number; }>; };
export default function Index({ course, students }: Props) {
    return <AdminLayout><Head title={`Alunos — ${course.title}`} /><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Curso</p><h1 className="mt-2 text-3xl font-black">Alunos de {course.title}</h1><div className="mt-8 grid gap-4">{students.map((student) => <article key={student.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_14rem]"><div><h2 className="font-bold">{student.name}</h2><p className="text-sm text-slate-600">{student.email}</p></div><ProgressBar value={student.progress} label="Progresso" /></article>)}{!students.length && <p className="rounded-xl bg-white p-6 text-slate-600">Ainda não há alunos matriculados.</p>}</div></AdminLayout>;
}
