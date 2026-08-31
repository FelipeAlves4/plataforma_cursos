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
    certificate?: { downloadUrl?: string; issueUrl?: string } | null;
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
        <section className="relative overflow-hidden border-b border-white/[0.1] pb-10 sm:pb-14"><div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#8138c5]/15 blur-3xl" /><div className="relative max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c28aff]">Sua biblioteca</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">Aprendizado que acompanha o seu ritmo.</h1><p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">Retome uma aula, conclua um curso ou volte a um conteúdo essencial.</p></div></section>
        {courses.length > 0 ? <><div aria-label="Filtrar meus cursos" className="student-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1" role="group">{filters.map((filter) => <button aria-pressed={activeFilter === filter.value} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d] ${activeFilter === filter.value ? 'border-[#c28aff]/60 bg-[#6329aa]/30 text-white' : 'border-white/[0.12] bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white'}`} key={filter.value} onClick={() => setActiveFilter(filter.value)} type="button">{filter.label}</button>)}</div>
            {visibleCourses.length ? <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{visibleCourses.map((course) => <article className="group overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#131018] shadow-[0_20px_54px_rgba(0,0,0,.2)] transition duration-300 motion-safe:hover:-translate-y-1" key={course.id}><Link aria-label={`Abrir curso ${course.title}`} className="relative block aspect-[16/10] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c28aff]" href={`/courses/${course.slug}`}><CourseCover className="transition duration-700 motion-safe:group-hover:scale-[1.05]" thumbnailPath={course.thumbnailPath} title={course.title} /><div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#131018] to-transparent" /><span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-bold backdrop-blur ${course.status === 'completed' ? 'border-emerald-300/25 bg-emerald-400/15 text-emerald-100' : course.status === 'in_progress' ? 'border-[#c28aff]/30 bg-[#481b70]/70 text-[#ecdfff]' : 'border-white/15 bg-black/35 text-white/75'}`}>{statusCopy[course.status].badge}</span></Link><div className="p-5 sm:p-6"><h2 className="text-xl font-black leading-snug tracking-[-0.025em] text-white">{course.title}</h2><p className="mt-3 text-sm text-white/55">{course.completedLessonCount} de {course.lessonCount} aulas concluídas</p><div className="mt-5"><ProgressBar label="Seu progresso" tone="dark" value={course.progress} /></div>{course.certificate && <p className="mt-4 text-sm font-bold text-[#d5b0ff]">Certificado {course.certificate.downloadUrl ? 'emitido' : 'disponível'}</p>}<Link className="asex-gradient mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#15101b]" href={`/courses/${course.slug}`}>{statusCopy[course.status].action} <span aria-hidden className="ml-2">→</span></Link></div></article>)}</div> : <div className="mt-9 rounded-[1.35rem] border border-dashed border-white/15 px-6 py-16 text-center"><h2 className="text-xl font-black text-white">Nenhum curso encontrado</h2><p className="mt-2 text-sm leading-6 text-white/55">Ajuste o filtro para ver outros cursos da sua biblioteca.</p></div>}</> : <div className="mt-12 max-w-2xl rounded-[1.35rem] border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center sm:px-10"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c28aff]">Seu acervo começa aqui</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Você ainda não começou nenhum curso.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base">Explore os conteúdos disponíveis e escolha seu próximo passo.</p><Link className="asex-gradient mt-8 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d]" href="/courses">Explorar cursos <span aria-hidden className="ml-2">→</span></Link></div>}
    </StudentLayout>;
}
