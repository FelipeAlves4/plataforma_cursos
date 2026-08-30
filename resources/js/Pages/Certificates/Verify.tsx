import BrandLogo from '@/Components/BrandLogo';
import { Head, Link } from '@inertiajs/react';

type Certificate = {
    courseTitle: string;
    completedAt: string;
    issuedAt: string;
    number: string;
    recipientName: string;
    workloadMinutes?: number | null;
};

const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));
const formatWorkload = (minutes?: number | null) => !minutes ? null : minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h${minutes % 60 ? `${String(minutes % 60).padStart(2, '0')}` : ''}`;

export default function Verify({ certificate }: { certificate: Certificate | null }) {
    return <><Head title={certificate ? 'Certificado válido' : 'Certificado não encontrado'} /><main className="min-h-screen bg-[#09070d] px-5 py-8 text-white sm:px-8 sm:py-12"><div className="mx-auto max-w-3xl"><Link aria-label="ASEX Educação" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" href="/"><BrandLogo className="h-11 w-24 object-contain" /></Link><section className="mt-10 overflow-hidden border border-white/[0.1] bg-[#15101b] shadow-2xl shadow-black/20"><div className={`p-7 sm:p-10 ${certificate ? 'bg-[linear-gradient(135deg,rgba(100,41,170,0.48),rgba(21,16,27,0))]' : 'bg-[linear-gradient(135deg,rgba(102,33,59,0.45),rgba(21,16,27,0))]'}`}><p className={`text-sm font-bold ${certificate ? 'text-emerald-200' : 'text-rose-200'}`}>{certificate ? '✓ Certificado válido' : 'Certificado não encontrado'}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{certificate ? 'Autenticidade confirmada' : 'Não encontramos este certificado'}</h1><p className="mt-4 max-w-xl text-base leading-7 text-white/65">{certificate ? 'Este certificado foi emitido pela ASEX Educação.' : 'Confira o link ou o código de verificação e tente novamente.'}</p></div>{certificate && <dl className="grid gap-6 p-7 sm:grid-cols-2 sm:p-10"><div><dt className="text-sm text-white/50">Participante</dt><dd className="mt-1 text-lg font-black text-white">{certificate.recipientName}</dd></div><div><dt className="text-sm text-white/50">Curso</dt><dd className="mt-1 text-lg font-black text-white">{certificate.courseTitle}</dd></div><div><dt className="text-sm text-white/50">Conclusão</dt><dd className="mt-1 font-bold text-white">{formatDate(certificate.completedAt)}</dd></div>{formatWorkload(certificate.workloadMinutes) && <div><dt className="text-sm text-white/50">Carga horária</dt><dd className="mt-1 font-bold text-white">{formatWorkload(certificate.workloadMinutes)}</dd></div>}<div><dt className="text-sm text-white/50">Número</dt><dd className="mt-1 break-all font-bold text-white">{certificate.number}</dd></div><div><dt className="text-sm text-white/50">Emitido em</dt><dd className="mt-1 font-bold text-white">{formatDate(certificate.issuedAt)}</dd></div></dl>}</section></div></main></>;
}
