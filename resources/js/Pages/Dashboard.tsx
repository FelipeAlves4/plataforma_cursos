import ContinueLearningCard from '@/Components/ContinueLearningCard';
import CourseCover from '@/Components/CourseCover';
import CourseRailCard from '@/Components/CourseRailCard';
import OfferCard from '@/Components/OfferCard';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ReactNode } from 'react';

type Course = {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    thumbnailPath?: string | null;
    category?: string | null;
    level?: string | null;
    progress: number;
    lessonCount: number;
    enrolled?: boolean;
};

type Offer = { id: number; programName: string; priceCents: number; expiresAt?: string | null; courseCount: number };

type ContinueLearning = {
    lessonId: number;
    lessonTitle: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
    thumbnailPath?: string | null;
    progress: number;
};

type Props = {
    courses: Course[];
    offers: Offer[];
    continueLearning?: ContinueLearning | null;
};

function Rail({ title, eyebrow, href, children }: { title: string; eyebrow?: string; href?: string; children: ReactNode }) {
    return (
        <section className="mt-11 sm:mt-14">
            <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                <div>
                    {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b879f4]">{eyebrow}</p>}
                    <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-white sm:text-2xl">{title}</h2>
                </div>
                {href && (
                    <Link className="shrink-0 text-xs font-bold text-white/48 transition hover:text-white sm:text-sm" href={href}>
                        Ver tudo <span aria-hidden className="ml-1 text-[#c28aff]">›</span>
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

export default function Dashboard({ courses, offers, continueLearning }: Props) {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user.name.split(' ')[0];
    const firstCourse = courses[0];

    const featured = continueLearning
        ? {
            title: continueLearning.courseTitle,
            subtitle: continueLearning.lessonTitle,
            detail: continueLearning.moduleTitle,
            thumbnailPath: continueLearning.thumbnailPath,
            href: `/lessons/${continueLearning.lessonId}`,
            action: 'Continuar assistindo',
        }
        : firstCourse
            ? {
                title: firstCourse.title,
                subtitle: firstCourse.description || 'Conteúdo prático para transformar conhecimento em ação.',
                detail: [firstCourse.category, firstCourse.level, `${firstCourse.lessonCount} aulas`].filter(Boolean).join(' · '),
                thumbnailPath: firstCourse.thumbnailPath,
                href: `/courses/${firstCourse.slug}`,
                action: firstCourse.progress > 0 ? 'Continuar curso' : 'Assistir agora',
            }
            : null;

    const categories = Array.from(new Set(courses.map((course) => course.category).filter((category): category is string => Boolean(category))));

    return (
        <StudentLayout>
            <Head title="Início" />

            <section className="relative isolate min-h-[600px] overflow-hidden sm:min-h-[650px] lg:min-h-[720px]">
                <div className="absolute inset-0">
                    {featured?.thumbnailPath ? (
                        <CourseCover className="h-full w-full scale-[1.015]" thumbnailPath={featured.thumbnailPath} title={featured.title} />
                    ) : (
                        <div className="h-full w-full bg-[url('/brand/student-hero-operations.png')] bg-cover bg-[70%_center]" />
                    )}
                    <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#08070d_0%,rgba(8,7,13,.96)_28%,rgba(8,7,13,.74)_48%,rgba(8,7,13,.2)_72%,rgba(8,7,13,.04)_100%)]" />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(180deg,transparent_0%,rgba(8,7,13,.38)_34%,#08070d_100%)]" />
                    <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#08070d]/60 to-transparent" />
                </div>

                <div className="relative z-10 flex min-h-[600px] items-end px-5 pb-32 pt-32 sm:min-h-[650px] sm:px-8 sm:pb-36 lg:min-h-[720px] lg:px-12 lg:pb-40 xl:px-16">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#c28aff]">
                            {featured ? 'Destaque para você' : `Bem-vindo, ${firstName}`}
                        </p>
                        <h1 className="mt-4 max-w-[11ch] text-4xl font-black leading-[.96] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                            {featured?.title || 'Sua próxima evolução começa aqui.'}
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                            {featured?.subtitle || 'Aprenda no seu ritmo com conteúdos práticos da ASEX Educação.'}
                        </p>
                        {featured?.detail && <p className="mt-4 text-sm font-semibold text-white/48">{featured.detail}</p>}

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                className="inline-flex min-h-12 items-center rounded-lg bg-white px-6 py-3 text-sm font-black text-[#0b0910] transition hover:bg-white/90"
                                href={featured?.href || '/courses'}
                            >
                                <span aria-hidden className="mr-2 text-base">▶</span>
                                {featured?.action || 'Explorar conteúdos'}
                            </Link>
                            {featured && (
                                <Link
                                    className="inline-flex min-h-12 items-center rounded-lg bg-white/[0.13] px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/[0.2]"
                                    href={continueLearning ? `/courses/${continueLearning.courseSlug}` : `/courses/${firstCourse?.slug}`}
                                >
                                    <span aria-hidden className="mr-2 text-base">ⓘ</span>
                                    Detalhes
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="relative z-20 -mt-20 px-5 sm:-mt-24 sm:px-8 lg:px-12 xl:px-16">
                {continueLearning && (
                    <Rail eyebrow="Retome de onde parou" title="Continue assistindo">
                        <div className="student-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
                            <div className="snap-start">
                                <ContinueLearningCard {...continueLearning} />
                            </div>
                        </div>
                    </Rail>
                )}

                {courses.length > 0 && (
                    <Rail eyebrow="Sua biblioteca" href="/my-courses" title="Minha lista">
                        <div className="student-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:gap-4 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
                            {courses.map((course) => (
                                <div className="snap-start" key={course.id}>
                                    <CourseRailCard course={course} />
                                </div>
                            ))}
                        </div>
                    </Rail>
                )}

                {categories.slice(0, 3).map((category) => {
                    const categoryCourses = courses.filter((course) => course.category === category);
                    if (!categoryCourses.length) return null;

                    return (
                        <Rail key={category} title={category}>
                            <div className="student-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:gap-4 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
                                {categoryCourses.map((course) => (
                                    <div className="snap-start" key={course.id}>
                                        <CourseRailCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </Rail>
                    );
                })}

                {offers.length > 0 && (
                    <Rail eyebrow="Selecionado para você" href="/courses" title="Programas disponíveis">
                        <div className={offers.length === 1 ? 'max-w-4xl' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
                            {offers.slice(0, 3).map((offer) => <OfferCard key={offer.id} offer={offer} />)}
                        </div>
                    </Rail>
                )}

                {!courses.length && !offers.length && (
                    <section className="mt-12 max-w-2xl border-t border-white/[0.08] py-14">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Sua biblioteca</p>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Seu próximo conteúdo vai aparecer aqui.</h2>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                            Quando um programa for preparado para você, ele aparecerá na sua tela inicial.
                        </p>
                        <Link className="mt-7 inline-flex text-sm font-black text-[#d3a5ff] transition hover:text-white" href="/courses">
                            Explorar programas <span aria-hidden className="ml-2">›</span>
                        </Link>
                    </section>
                )}
            </div>
        </StudentLayout>
    );
}
