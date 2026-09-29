import CourseCover from '@/Components/CourseCover';
import OfferCard from '@/Components/OfferCard';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

type Course = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    thumbnailPath?: string | null;
    category?: string | null;
    level?: string | null;
    lessonCount: number;
    moduleCount: number;
    durationMinutes?: number | null;
    progress: number;
    enrolled: boolean;
};

type Offer = { id: number; programName: string; priceCents: number; expiresAt?: string | null; courseCount: number };

function CourseTile({ course }: { course: Course }) {
    const content = (
        <>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-[#15111a]">
                <CourseCover className="transition duration-700 motion-safe:group-hover:scale-[1.05]" thumbnailPath={course.thumbnailPath} title={course.title} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070d]/92 via-[#08070d]/12 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mb-3 flex items-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
                        <span className={`grid h-9 w-9 place-items-center rounded-full text-xs shadow-lg ${course.enrolled ? 'bg-white text-[#08070d]' : 'border border-white/30 bg-black/40 text-white'}`}>
                            {course.enrolled ? '▶' : '🔒'}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d0a5ff]">
                        {[course.category, course.level].filter(Boolean).join(' · ') || `${course.lessonCount} aulas`}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight tracking-[-0.02em] text-white">{course.title}</h3>
                </div>
                {course.enrolled && course.progress > 0 && (
                    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
                        <div className="h-full bg-[#a855f7]" style={{ width: `${course.progress}%` }} />
                    </div>
                )}
            </div>
            <div className="pt-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-white/42">
                        {course.lessonCount} aulas
                        {course.durationMinutes ? ` · ${course.durationMinutes} min` : ''}
                    </p>
                    <span className={`text-[11px] font-black ${course.enrolled ? 'text-[#c28aff]' : 'text-white/38'}`}>
                        {course.enrolled ? (course.progress > 0 ? `${course.progress}% concluído` : 'Na sua lista') : 'Acesso por matrícula'}
                    </span>
                </div>
            </div>
        </>
    );

    return course.enrolled ? (
        <Link
            aria-label={`Abrir curso ${course.title}`}
            className="group block min-w-0 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff] motion-safe:hover:-translate-y-1"
            href={`/courses/${course.slug}`}
        >
            {content}
        </Link>
    ) : (
        <article className="group min-w-0 opacity-90">
            {content}
        </article>
    );
}

export default function Index({ courses, offers }: { courses: Course[]; offers: Offer[] }) {
    const featured = courses[0];
    const categories = Array.from(new Set(courses.map((course) => course.category).filter((category): category is string => Boolean(category))));

    return (
        <StudentLayout>
            <Head title="Explorar" />

            {featured ? (
                <section className="-mx-5 -mt-24 overflow-hidden sm:-mx-8 sm:-mt-28 lg:-mx-12 xl:-mx-16">
                    <div className="relative min-h-[520px] sm:min-h-[590px]">
                        <div className="absolute inset-0">
                            <CourseCover className="h-full w-full scale-[1.01]" thumbnailPath={featured.thumbnailPath} title={featured.title} />
                            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#08070d_0%,rgba(8,7,13,.95)_30%,rgba(8,7,13,.67)_52%,rgba(8,7,13,.18)_78%,rgba(8,7,13,.03)_100%)]" />
                            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#08070d] via-[#08070d]/52 to-transparent" />
                        </div>

                        <div className="relative flex min-h-[520px] items-end px-5 pb-24 pt-32 sm:min-h-[590px] sm:px-8 sm:pb-28 lg:px-12 xl:px-16">
                            <div className="max-w-2xl">
                                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c28aff]">Explore na ASEX</p>
                                <h1 className="mt-4 max-w-[12ch] text-4xl font-black leading-[.96] tracking-[-0.06em] text-white sm:text-6xl">{featured.title}</h1>
                                {featured.description && <p className="mt-5 max-w-xl text-base leading-7 text-white/68 sm:text-lg">{featured.description}</p>}
                                <p className="mt-4 text-sm font-semibold text-white/46">
                                    {[featured.category, featured.level, `${featured.lessonCount} aulas`, featured.durationMinutes ? `${featured.durationMinutes} min` : null].filter(Boolean).join(' · ')}
                                </p>
                                <div className="mt-7">
                                    {featured.enrolled ? (
                                        <Link className="inline-flex min-h-12 items-center rounded-lg bg-white px-6 py-3 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href={`/courses/${featured.slug}`}>
                                            <span aria-hidden className="mr-2">▶</span>
                                            {featured.progress > 0 ? 'Continuar' : 'Assistir agora'}
                                        </Link>
                                    ) : (
                                        <span className="inline-flex min-h-12 items-center rounded-lg bg-white/[0.12] px-6 py-3 text-sm font-bold text-white backdrop-blur">🔒 Acesso por matrícula</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="border-b border-white/[0.07] pb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b879f4]">Seleção ASEX</p>
                    <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Explore sua próxima evolução.</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/52">Novos conteúdos aparecerão aqui assim que forem publicados.</p>
                </section>
            )}

            {courses.length > 0 && (
                <div className={featured ? 'relative -mt-12 sm:-mt-16' : 'mt-10'}>
                    <section>
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b879f4]">Catálogo</p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">Todos os cursos</h2>
                            </div>
                            <p className="text-xs font-semibold text-white/32">{courses.length} {courses.length === 1 ? 'conteúdo' : 'conteúdos'}</p>
                        </div>
                        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {courses.map((course) => <CourseTile course={course} key={course.id} />)}
                        </div>
                    </section>

                    {categories.map((category) => {
                        const categoryCourses = courses.filter((course) => course.category === category);
                        if (categoryCourses.length < 2) return null;

                        return (
                            <section className="mt-14" key={category}>
                                <h2 className="mb-5 text-xl font-black tracking-[-0.035em] text-white sm:text-2xl">{category}</h2>
                                <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {categoryCourses.map((course) => <CourseTile course={course} key={course.id} />)}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {offers.length > 0 && (
                <section className="mt-16 border-t border-white/[0.07] pt-10">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b879f4]">Acesso</p>
                        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">Programas disponíveis para você</h2>
                    </div>
                    <div className={offers.length === 1 ? 'max-w-4xl' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
                        {offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                    </div>
                </section>
            )}

            {!courses.length && !offers.length && (
                <section className="mt-10 max-w-2xl border-t border-white/[0.08] py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Em breve</p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Nenhum conteúdo disponível agora.</h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">Quando novos cursos forem publicados, eles aparecerão aqui.</p>
                    <Link className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href="/my-courses">Ir para minha lista</Link>
                </section>
            )}
        </StudentLayout>
    );
}
