import CourseCard from '@/Components/CourseCard';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

type Props = { courses: Array<{ id: number; title: string; slug: string; description?: string | null; thumbnailPath?: string | null; progress: number; lessonCount: number; }>; };

export default function Dashboard({ courses }: Props) {
    return (
        <AppLayout>
            <Head title="Meus cursos" />
            <section className="mb-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Sua jornada</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Continue de onde parou.</h1><p className="mt-3 text-lg text-slate-600">Seu progresso é salvo automaticamente a cada aula.</p></section>
            {courses.length ? <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</section> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Você ainda não está matriculado em nenhum curso.</div>}
        </AppLayout>
    );
}
