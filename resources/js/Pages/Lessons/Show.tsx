import ProgressBar from '@/Components/ProgressBar';
import VideoPlayer from '@/Components/VideoPlayer';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Lesson = {
    id: number;
    title: string;
    description?: string | null;
    videoProvider: 'youtube' | 'panda';
    videoId?: string | null;
    videoUrl?: string | null;
    completed: boolean;
    number: number;
};

type CourseLesson = { id: number; title: string; number: number; completed: boolean };
type Props = {
    lesson: Lesson;
    course: {
        slug: string;
        title: string;
        instructor?: string | null;
        category?: string | null;
        level?: string | null;
        progress: { completedLessons: number; totalLessons: number; percentage: number };
        modules: { id: number; title: string; position: number; lessons: CourseLesson[] }[];
    };
    navigation: { previousLessonId?: number | null; nextLessonId?: number | null };
};

const lessonNumber = (number: number) => String(number).padStart(2, '0');

export default function Show({ lesson, course, navigation }: Props) {
    const [completed, setCompleted] = useState(lesson.completed);
    const [processing, setProcessing] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const completedLessons = course.progress.completedLessons + (completed === lesson.completed ? 0 : completed ? 1 : -1);
    const courseCompleted = course.progress.totalLessons > 0 && completedLessons === course.progress.totalLessons;
    const progressPercentage = course.progress.totalLessons > 0 ? Math.round((completedLessons / course.progress.totalLessons) * 100) : 0;

    const update = (nextCompleted: boolean, nextLessonId?: number | null) => {
        const previous = completed;
        setCompleted(nextCompleted);
        setFeedbackError(null);

        router.put(`/lessons/${lesson.id}/progress`, { completed: nextCompleted }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onError: () => {
                setCompleted(previous);
                setFeedbackError('Não foi possível atualizar o progresso. Tente novamente.');
            },
            onSuccess: () => {
                if (nextLessonId) {
                    router.visit(`/lessons/${nextLessonId}`);
                }
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title={lesson.title} />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start xl:gap-10">
                <section className="min-w-0">
                    <VideoPlayer provider={lesson.videoProvider} title={lesson.title} videoId={lesson.videoId} videoUrl={lesson.videoUrl} />

                    <div className="mt-7 border-b border-asex-border pb-7">
                        <p className="eyebrow text-brand-700">Aula {lessonNumber(lesson.number)}</p>
                        <Link className="mt-3 inline-block text-base font-bold text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" href={`/courses/${course.slug}`}>{course.title}</Link>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">{lesson.title}</h1>
                        {lesson.description && <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-ink/65">{lesson.description}</p>}
                    </div>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-bold text-ink">Acompanhamento da aula</p>
                            <p className="mt-1 text-sm text-ink/60">Marque quando concluir para atualizar seu progresso.</p>
                        </div>
                        <button className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${completed ? 'bg-brand-100 text-brand-700 hover:bg-brand-300' : 'asex-gradient text-white shadow-sm'}`} disabled={processing} type="button" onClick={() => update(!completed)}>{processing ? 'Salvando…' : completed ? '✓ Aula concluída' : 'Marcar como concluída'}</button>
                    </div>
                    {feedbackError && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{feedbackError}</p>}

                    {courseCompleted && <div className="mt-7 rounded-2xl border border-brand-100 bg-sand p-6"><p className="text-lg font-black text-ink">Curso concluído 🎉</p><p className="mt-2 text-sm leading-6 text-ink/65">Você concluiu todas as aulas de {course.title}.</p></div>}

                    <nav aria-label="Navegação entre aulas" className="mt-8 flex flex-col gap-3 border-t border-asex-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                        {navigation.previousLessonId ? <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/15 px-4 py-3 text-sm font-bold text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2" href={`/lessons/${navigation.previousLessonId}`}>← Aula anterior</Link> : <span />}
                        {navigation.nextLessonId ? <button className="asex-gradient inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={processing} type="button" onClick={() => update(true, navigation.nextLessonId)}>Próxima aula →</button> : <p className="rounded-lg bg-sand px-4 py-3 text-center text-sm font-semibold text-ink/65">{courseCompleted ? 'Você chegou ao final deste curso.' : 'Esta é a última aula do curso.'}</p>}
                    </nav>
                </section>

                <aside className="overflow-hidden rounded-2xl border border-asex-border bg-white shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
                    <div className="border-b border-asex-border px-5 py-5">
                        <p className="eyebrow text-brand-700">Conteúdo do curso</p>
                        <h2 className="mt-2 text-xl font-black text-ink">{course.title}</h2>
                        {(course.instructor || course.category || course.level) && <p className="mt-2 text-sm text-ink/55">{[course.instructor, course.category, course.level].filter(Boolean).join(' · ')}</p>}
                    </div>
                    <div className="border-b border-asex-border px-5 py-5">
                        <p className="mb-3 text-sm font-bold text-ink">Progresso do curso</p>
                        <p className="mb-3 text-sm text-ink/60">{completedLessons} de {course.progress.totalLessons} aulas concluídas</p>
                        <ProgressBar label="Progresso" value={progressPercentage} />
                    </div>
                    <div className="max-h-80 overflow-y-auto p-3 lg:max-h-[calc(100vh-18rem)]">
                        {course.modules.length ? course.modules.map((module) => <section key={module.id} className="mb-4 last:mb-0"><div className="px-2 py-2"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Módulo {lessonNumber(module.position)}</p><h3 className="mt-1 text-sm font-black text-ink">{module.title}</h3></div><div className="space-y-1">{module.lessons.map((courseLesson) => {
                            const isCurrent = courseLesson.id === lesson.id;
                            const isCompleted = isCurrent ? completed : courseLesson.completed;
                            const icon = isCompleted ? '✓' : isCurrent ? '▶' : '○';

                            return <Link aria-current={isCurrent ? 'step' : undefined} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isCurrent ? 'border-brand-300 bg-brand-100 font-bold text-ink shadow-sm' : isCompleted ? 'border-transparent text-brand-700 hover:bg-sand' : 'border-transparent text-ink/65 hover:bg-sand'}`} href={`/lessons/${courseLesson.id}`} key={courseLesson.id}><span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${isCurrent ? 'bg-brand-700 text-white' : isCompleted ? 'bg-brand-100 text-brand-700' : 'bg-sand text-ink/55'}`}>{icon}</span><span className="min-w-0 flex-1"><span className="mr-2 text-xs font-bold text-ink/45">{lessonNumber(courseLesson.number)}.</span><span>{courseLesson.title}</span></span></Link>;
                        })}</div></section>) : <p className="px-3 py-6 text-center text-sm leading-6 text-ink/60">Este curso ainda não possui aulas disponíveis.</p>}
                    </div>
                </aside>
            </div>
        </AppLayout>
    );
}
