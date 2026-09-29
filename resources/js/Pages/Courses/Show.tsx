import CourseCover from '@/Components/CourseCover';
import LessonRow from '@/Components/LessonRow';
import ProgressBar from '@/Components/ProgressBar';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

type Lesson = {
    id: number;
    title: string;
    durationSeconds?: number | null;
    videoId?: string | null;
    isPreview: boolean;
    completed: boolean;
};

type Props = {
    course: {
        title: string;
        slug: string;
        description?: string | null;
        thumbnailPath?: string | null;
        progress: number;
        nextLessonId?: number | null;
        instructor?: string | null;
        category?: string | null;
        level?: string | null;
        lessonCount: number;
        moduleCount: number;
        certificate: { enabled: boolean; eligible: boolean; downloadUrl?: string | null; issueUrl: string };
        modules: Array<{ id: number; title: string; position: number; completedLessons: number; lessons: Lesson[] }>;
    };
};

export default function Show({ course }: Props) {
    const durationMinutes = Math.ceil(
        course.modules.flatMap((module) => module.lessons).reduce((seconds, lesson) => seconds + (lesson.durationSeconds ?? 0), 0) / 60,
    );

    const metadata = [
        course.instructor && `Com ${course.instructor}`,
        course.category,
        course.level,
        `${course.lessonCount} aulas`,
        durationMinutes > 0 && `${durationMinutes} min`,
    ].filter((item): item is string => typeof item === 'string');

    const actionLabel = course.progress === 100 ? 'Revisar curso' : course.progress > 0 ? 'Continuar assistindo' : 'Assistir agora';

    return (
        <StudentLayout>
            <Head title={course.title} />

            <section className="-mx-5 -mt-24 sm:-mx-8 sm:-mt-28 lg:-mx-12 xl:-mx-16">
                <div className="relative isolate min-h-[610px] overflow-hidden sm:min-h-[680px] lg:min-h-[730px]">
                    <div className="absolute inset-0">
                        <CourseCover className="h-full w-full scale-[1.01]" thumbnailPath={course.thumbnailPath} title={course.title} />
                        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#08070d_0%,rgba(8,7,13,.96)_30%,rgba(8,7,13,.68)_52%,rgba(8,7,13,.18)_76%,rgba(8,7,13,.05)_100%)]" />
                        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,transparent_0%,rgba(8,7,13,.46)_38%,#08070d_100%)]" />
                    </div>

                    <div className="relative z-10 flex min-h-[610px] items-end px-5 pb-28 pt-32 sm:min-h-[680px] sm:px-8 sm:pb-32 lg:min-h-[730px] lg:px-12 lg:pb-36 xl:px-16">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c28aff]">{course.category || 'Curso ASEX'}</p>
                            <h1 className="mt-4 max-w-[12ch] text-4xl font-black leading-[.96] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{course.title}</h1>

                            {course.description && <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">{course.description}</p>}

                            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold text-white/52">
                                {metadata.map((item, index) => (
                                    <span className="inline-flex items-center" key={item}>
                                        {index > 0 && <span aria-hidden className="mr-3 text-white/22">•</span>}
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-7 max-w-sm">
                                <ProgressBar label="Seu progresso" tone="dark" value={course.progress} />
                            </div>

                            <div className="mt-7 flex flex-wrap gap-3">
                                {course.nextLessonId && (
                                    <Link className="inline-flex min-h-12 items-center rounded-lg bg-white px-6 py-3 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href={`/lessons/${course.nextLessonId}`}>
                                        <span aria-hidden className="mr-2">▶</span>
                                        {actionLabel}
                                    </Link>
                                )}
                                <Link className="inline-flex min-h-12 items-center rounded-lg bg-white/[0.12] px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/[0.19]" href="/my-courses">
                                    <span aria-hidden className="mr-2 text-base">✓</span>
                                    Na minha lista
                                </Link>
                            </div>

                            {course.progress === 100 && course.certificate.enabled && (
                                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold">
                                    <span className="text-emerald-300">✓ Curso concluído</span>
                                    {course.certificate.downloadUrl ? (
                                        <a className="text-[#d5b0ff] transition hover:text-white" href={course.certificate.downloadUrl}>Baixar certificado</a>
                                    ) : course.certificate.eligible ? (
                                        <Link as="button" className="text-[#d5b0ff] transition hover:text-white" href={course.certificate.issueUrl} method="post">Emitir certificado</Link>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative -mt-16 pb-10 sm:-mt-20">
                <div className="mb-6 max-w-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b879f4]">Conteúdo do curso</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">Aulas da trilha</h2>
                </div>

                <div className="space-y-7">
                    {course.modules.length ? course.modules.map((module) => (
                        <section key={module.id}>
                            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c28aff]">Módulo {String(module.position).padStart(2, '0')}</p>
                                    <h3 className="mt-1 text-lg font-black text-white">{module.title}</h3>
                                </div>
                                <p className="text-xs font-semibold text-white/38">{module.completedLessons} de {module.lessons.length} aulas</p>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.025]">
                                <div className="divide-y divide-white/[0.055]">
                                    {module.lessons.map((lesson, index) => (
                                        <LessonRow
                                            completed={lesson.completed}
                                            current={lesson.id === course.nextLessonId}
                                            durationSeconds={lesson.durationSeconds}
                                            id={lesson.id}
                                            key={lesson.id}
                                            number={index + 1}
                                            title={lesson.title}
                                            videoId={lesson.videoId}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )) : (
                        <div className="border-t border-white/[0.08] py-14 text-center text-sm text-white/48">Este curso ainda não possui aulas disponíveis.</div>
                    )}
                </div>
            </section>
        </StudentLayout>
    );
}
