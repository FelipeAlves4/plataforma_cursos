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

    return <StudentLayout><Head title="Meus certificados" />
        <section className="relative isolate overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#131018] px-6 py-10 shadow-[0_22px_64px_rgba(0,0,0,.2)] sm:px-10 sm:py-14 lg:px-14"><div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_75%_45%,rgba(133,58,201,.24),transparent_55%)] lg:block" /><div className="relative max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c28aff]">ASEX Educação</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">Conquistas que ficam.</h1><p className="mt-5 text-base leading-7 text-white/65 sm:text-lg">Seus certificados de conclusão, prontos para guardar e compartilhar.</p></div></section>
        {availableCourses.length > 0 && <section className="mt-8 border border-[#9347dd]/35 bg-[#2b0870]/35 p-5 sm:p-6"><p className="text-sm font-bold text-[#d5b0ff]">Certificados disponíveis</p><h2 className="mt-2 text-xl font-black text-white">Você concluiu cursos que ainda não possuem certificado emitido.</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{availableCourses.map((course) => <article className="flex flex-wrap items-center justify-between gap-4 border border-white/[0.1] bg-[#15101b] p-4" key={course.id}><p className="font-bold text-white">{course.title}</p><Link as="button" className="asex-gradient inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href={course.issueUrl} method="post">Emitir certificado</Link></article>)}</div></section>}
        {hasCertificates ? <section className={certificates.length === 1 ? 'mt-8 max-w-3xl' : 'mt-8 grid gap-6 xl:grid-cols-2'}>{certificates.map((certificate) => <article className="overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#131018] shadow-[0_20px_54px_rgba(0,0,0,.2)]" key={certificate.number}><div className="border-b border-white/[0.08] bg-[linear-gradient(135deg,rgba(113,46,177,.46),rgba(19,16,24,0)_72%)] p-6 sm:p-7"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d5b0ff]">Certificado emitido</p><h2 className="mt-4 text-2xl font-black leading-snug tracking-[-0.03em] text-white">{certificate.courseTitle}</h2><p className="mt-3 text-sm text-white/60">Concluído em {formatDate(certificate.completedAt)}</p></div><div className="p-6 sm:p-7"><dl className="grid gap-5 text-sm sm:grid-cols-2"><div><dt className="text-white/45">Carga horária</dt><dd className="mt-1 font-bold text-white">{formatWorkload(certificate.workloadMinutes) ?? 'Não informada'}</dd></div><div><dt className="text-white/45">Número do certificado</dt><dd className="mt-1 break-all font-bold text-white">{certificate.number}</dd></div></dl><div className="mt-7 flex flex-col gap-3 sm:flex-row"><a className="asex-gradient inline-flex min-h-12 flex-1 items-center justify-center rounded-lg px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href={certificate.downloadUrl}>Baixar certificado</a><a className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-white/[0.16] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" href={certificate.verificationUrl} rel="noreferrer" target="_blank">Ver autenticidade</a></div></div></article>)}</section> : availableCourses.length === 0 && <section className="mt-8 max-w-2xl rounded-[1.35rem] border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center sm:px-10"><h2 className="text-2xl font-black text-white">Seus certificados aparecerão aqui</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55 sm:text-base">Conclua seus cursos para liberar novos certificados.</p><Link className="asex-gradient mt-7 inline-flex min-h-12 items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href="/my-courses">Meus cursos <span aria-hidden className="ml-2">→</span></Link></section>}
    </StudentLayout>;
}
