import ContinueLearningCard from '@/Components/ContinueLearningCard';
import CourseCover from '@/Components/CourseCover';
import CoursePoster from '@/Components/CoursePoster';
import CourseRailCard from '@/Components/CourseRailCard';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ReactNode } from 'react';

type Course = { id: number; title: string; slug: string; thumbnailPath?: string | null; videoId?: string | null; category?: string | null; level?: string | null; progress: number; lessonCount: number; enrolled?: boolean; };
type Props = { courses: Course[]; recommendedCourses: Course[]; continueLearning?: { lessonId: number; lessonTitle: string; moduleTitle: string; courseTitle: string; courseSlug: string; thumbnailPath?: string | null; videoId?: string | null; progress: number } | null; };

function Rail({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
    return <section className="mt-12 sm:mt-16"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h2>{href && <Link className="text-sm font-bold text-[#c28aff] transition hover:text-white" href={href}>Ver todos <span aria-hidden>→</span></Link>}</div>{children}</section>;
}

export default function Dashboard({ courses, recommendedCourses, continueLearning }: Props) {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user.name.split(' ')[0];

    return <StudentLayout><Head title="Minha aprendizagem" />
        <section className="relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[#15101b] px-6 py-10 sm:px-10 sm:py-14 lg:min-h-[350px] lg:px-14 lg:py-16">
            <span aria-hidden className="absolute -right-16 -top-24 h-[28rem] w-[28rem] rotate-45 border border-[#9347dd]/35" /><span aria-hidden className="absolute right-[10%] top-[15%] h-56 w-56 rounded-full bg-[#6429aa]/20 blur-3xl" />
            {continueLearning && <div className="absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden lg:block"><CourseCover className="h-full w-full opacity-70" thumbnailPath={continueLearning.thumbnailPath} title={continueLearning.courseTitle} videoId={continueLearning.videoId} /><span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#15101b_2%,rgba(21,16,27,0.58)_47%,rgba(21,16,27,0.06)_100%)]" /></div>}
            <div className="relative max-w-2xl"><h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Olá, {firstName}.</h1><p className="mt-4 text-xl leading-relaxed text-[#d9c5ee] sm:text-2xl">Continue evoluindo o seu negócio.</p>{continueLearning ? <Link className="asex-gradient mt-8 inline-flex min-h-12 items-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110" href={`/lessons/${continueLearning.lessonId}`}>Continuar estudando <span aria-hidden className="ml-2">→</span></Link> : <Link className="asex-gradient mt-8 inline-flex min-h-12 items-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110" href="/courses">Explorar cursos <span aria-hidden className="ml-2">→</span></Link>}</div>
        </section>
        {continueLearning && <section className="mt-10 sm:mt-14"><h2 className="mb-5 text-2xl font-black tracking-tight text-white sm:text-3xl">Continue aprendendo</h2><ContinueLearningCard {...continueLearning} /></section>}
        {courses.length > 0 && <Rail href="/courses?status=in_progress" title="Meus cursos"><div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-0 lg:px-0">{courses.map((course) => <div className="snap-start" key={course.id}><CourseRailCard course={course} /></div>)}</div></Rail>}
        {!courses.length && <section className="mt-12 max-w-xl border-l border-[#9347dd]/50 pl-5 sm:mt-16"><h2 className="text-2xl font-black tracking-tight text-white">Sua biblioteca está pronta para começar.</h2><p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">Explore os cursos disponíveis e encontre a próxima aula para o seu momento.</p><Link className="mt-5 inline-flex text-sm font-bold text-[#c28aff] transition hover:text-white" href="/courses">Explorar cursos <span aria-hidden className="ml-1">→</span></Link></section>}
        {recommendedCourses.length >= 2 && <Rail href="/courses" title="Recomendados"><div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-0 lg:px-0">{recommendedCourses.map((course) => <div className="snap-start" key={course.id}><CoursePoster course={course} /></div>)}</div></Rail>}
    </StudentLayout>;
}
