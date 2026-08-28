import CourseCover from '@/Components/CourseCover';
import ProgressBar from '@/Components/ProgressBar';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Status = 'not_started' | 'in_progress' | 'completed';
type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnailPath?: string | null;
    lessonCount: number;
    completedLessonCount: number;
    progress: number;
    status: Status;
};
type Filter = 'all' | Status;

const filters: Array<{ label: string; value: Filter }> = [
    { label: 'Todos', value: 'all' },
    { label: 'Em andamento', value: 'in_progress' },
    { label: 'Concluídos', value: 'completed' },
];

const statusCopy: Record<Status, { badge: string; action: string }> = {
    not_started: { badge: 'Não iniciado', action: 'Começar curso' },
    in_progress: { badge: 'Em andamento', action: 'Continuar curso' },
    completed: { badge: 'Concluído', action: 'Revisar curso' },
};

export default function MyCourses({ courses }: { courses: Course[] }) {
    const [activeFilter, setActiveFilter] = useState<Filter>('all');
    const visibleCourses = useMemo(
        () => activeFilter === 'all' ? courses : courses.filter((course) => course.status === activeFilter),
        [activeFilter, courses],
    );

    return <StudentLayout><Head title="Meus cursos" />
        <section className="relative overflow-hidden border-b border-white/[0.08] pb-10 sm:pb-14"><span aria-hidden className="absolute right-0 top-0 h-64 w-64 rotate-45 border border-[#9347dd]/35" /><div className="relative max-w-3xl"><h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Meus cursos</h1><p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">Continue sua jornada de aprendizado.</p></div></section>
        {courses.length > 0 ? <><div aria-label="Filtrar meus cursos" className="mt-7 flex gap-2 overflow-x-auto pb-1" role="group">{filters.map((filter) => <button aria-pressed={activeFilter === filter.value} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d] ${activeFilter === filter.value ? 'border-[#c28aff] bg-[#6429aa]/35 text-white' : 'border-white/[0.12] text-white/60 hover:border-white/30 hover:text-white'}`} key={filter.value} onClick={() => setActiveFilter(filter.value)} type="button">{filter.label}</button>)}</div>
            {visibleCourses.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleCourses.map((course) => <article className="group overflow-hidden rounded-2xl border border-white/[0.1] bg-[#15101b] shadow-2xl shadow-black/15" key={course.id}><Link aria-label={`Abrir curso ${course.title}`} className="block aspect-video overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c28aff]" href={`/courses/${course.slug}`}><CourseCover className="transition duration-500 motion-safe:group-hover:scale-[1.04]" thumbnailPath={course.thumbnailPath} title={course.title} /></Link><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-xl font-black leading-snug text-white">{course.title}</h2><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${course.status === 'completed' ? 'bg-emerald-400/15 text-emerald-200' : course.status === 'in_progress' ? 'bg-[#9347dd]/25 text-[#dfc7ff]' : 'bg-white/[0.08] text-white/65'}`}>{statusCopy[course.status].badge}</span></div><p className="mt-4 text-sm text-white/55">{course.completedLessonCount} de {course.lessonCount} aulas concluídas</p><div className="mt-4"><ProgressBar label="Progresso" tone="dark" value={course.progress} /></div><Link className="asex-gradient mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#15101b]" href={`/courses/${course.slug}`}>{statusCopy[course.status].action} <span aria-hidden className="ml-2">→</span></Link></div></article>)}</div> : <div className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center"><h2 className="text-xl font-black text-white">Nenhum curso encontrado</h2><p className="mt-2 text-sm leading-6 text-white/55">Ajuste o filtro para ver outros cursos da sua biblioteca.</p></div>}</> : <div className="mt-8 max-w-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center sm:px-10"><h2 className="text-2xl font-black text-white">Você ainda não começou nenhum curso.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55 sm:text-base">Explore os conteúdos disponíveis e escolha seu próximo passo.</p><Link className="asex-gradient mt-7 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d]" href="/courses">Explorar cursos <span aria-hidden className="ml-2">→</span></Link></div>}
    </StudentLayout>;
}
