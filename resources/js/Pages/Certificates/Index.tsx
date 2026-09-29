import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

type Certificate = {
    courseTitle: string;
    completedAt: string;
    downloadUrl: string;
    issuedAt: string;
    number: string;
    recipientName: string;
    verificationUrl: string;
    workloadMinutes?: number | null;
};

type AvailableCourse = { id: number; title: string; issueUrl: string };

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));

function formatWorkload(minutes?: number | null): string | null {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursLabel = hours === 1 ? '1 hora' : `${hours} horas`;

    return remainingMinutes ? `${hoursLabel} e ${remainingMinutes} min` : hoursLabel;
}

export default function Index({ certificates, availableCourses }: { certificates: Certificate[]; availableCourses: AvailableCourse[] }) {
    const hasCertificates = certificates.length > 0;

    return (
        <StudentLayout>
            <Head title="Certificados" />

            <section className="border-b border-white/[0.07] pb-8 sm:pb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b879f4]">Sua jornada</p>
                <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Certificados</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
                            Suas conquistas concluídas e prontas para compartilhar.
                        </p>
                    </div>
                    {hasCertificates && <p className="text-sm font-semibold text-white/36">{certificates.length} {certificates.length === 1 ? 'certificado' : 'certificados'}</p>}
                </div>
            </section>

            {availableCourses.length > 0 && (
                <section className="mt-8">
                    <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Prontos para emitir</p>
                        <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Você concluiu novos cursos</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {availableCourses.map((course) => (
                            <article className="flex min-h-28 flex-col justify-between rounded-lg border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-[#a855f7]/35 hover:bg-white/[0.04]" key={course.id}>
                                <p className="font-black leading-snug text-white">{course.title}</p>
                                <Link as="button" className="mt-5 inline-flex w-fit items-center text-sm font-black text-[#c28aff] transition hover:text-white" href={course.issueUrl} method="post">
                                    Emitir certificado <span aria-hidden className="ml-2">›</span>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {hasCertificates ? (
                <section className="mt-10">
                    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                        {certificates.map((certificate) => (
                            <article className="group overflow-hidden rounded-lg border border-white/[0.08] bg-[#111015] transition duration-300 hover:border-white/[0.14] hover:bg-[#141119]" key={certificate.number}>
                                <div className="relative overflow-hidden p-6 sm:p-7">
                                    <div aria-hidden className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#7c3cc0]/16 blur-3xl" />
                                    <div className="relative">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c28aff]">Certificado ASEX</p>
                                                <h2 className="mt-3 text-xl font-black leading-snug tracking-[-0.03em] text-white sm:text-2xl">{certificate.courseTitle}</h2>
                                            </div>
                                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.04] text-lg text-[#d5b0ff]">✓</span>
                                        </div>

                                        <dl className="mt-6 grid gap-4 border-t border-white/[0.07] pt-5 text-sm sm:grid-cols-2">
                                            <div>
                                                <dt className="text-xs font-semibold text-white/35">Conclusão</dt>
                                                <dd className="mt-1 font-bold text-white/78">{formatDate(certificate.completedAt)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs font-semibold text-white/35">Carga horária</dt>
                                                <dd className="mt-1 font-bold text-white/78">{formatWorkload(certificate.workloadMinutes) ?? 'Não informada'}</dd>
                                            </div>
                                        </dl>

                                        <p className="mt-5 break-all text-[11px] font-semibold text-white/28">{certificate.number}</p>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <a className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2.5 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href={certificate.downloadUrl}>
                                                Baixar PDF
                                            </a>
                                            <a className="inline-flex min-h-11 items-center rounded-lg bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-white/78 transition hover:bg-white/[0.12] hover:text-white" href={certificate.verificationUrl} rel="noreferrer" target="_blank">
                                                Ver autenticidade
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ) : availableCourses.length === 0 ? (
                <section className="mt-10 max-w-2xl border-t border-white/[0.08] py-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c28aff]">Sua coleção começa aqui</p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">Seus certificados aparecerão aqui.</h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-white/52 sm:text-base">Conclua seus cursos para liberar novas conquistas.</p>
                    <Link className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 text-sm font-black text-[#0b0910] transition hover:bg-white/90" href="/my-courses">
                        Ir para minha lista
                    </Link>
                </section>
            ) : null}
        </StudentLayout>
    );
}
