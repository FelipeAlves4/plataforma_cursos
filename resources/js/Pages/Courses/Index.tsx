import CoursePoster from '@/Components/CoursePoster';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Course = { id: number; title: string; slug: string; thumbnailPath?: string | null; videoId?: string | null; category?: string | null; level?: string | null; lessonCount: number; enrolled: boolean; progress: number; status: string };
type Props = { courses: Course[]; filters: { search?: string; category?: string; level?: string; status?: string }; categories: string[]; levels: string[] };

export default function Index({ courses, filters, categories, levels }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const updateFilter = (field: 'category' | 'level', value: string) => router.get('/courses', { ...filters, [field]: value || undefined }, { preserveState: true, replace: true });
    const apply = (event: FormEvent) => { event.preventDefault(); router.get('/courses', { ...filters, search: search || undefined }, { preserveState: true, replace: true }); };

    return <StudentLayout><Head title="Explorar cursos" />
        <section className="relative overflow-hidden border-b border-white/[0.08] pb-10 sm:pb-14"><span aria-hidden className="absolute right-0 top-0 h-64 w-64 rotate-45 border border-[#9347dd]/35" /><div className="relative max-w-3xl"><h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Explore cursos para fazer seu negócio avançar.</h1><p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">Descubra conteúdos práticos para aplicar na gestão do seu restaurante.</p></div></section>
        <form className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]" onSubmit={apply}><label className="sr-only" htmlFor="course-search">Buscar cursos</label><input className="min-h-12 rounded-lg border border-white/[0.14] bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/35" id="course-search" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cursos" value={search} /><select className="min-h-12 rounded-lg border border-white/[0.14] bg-[#17111e] px-4 text-sm text-white" onChange={(event) => updateFilter('category', event.target.value)} value={filters.category ?? ''}><option value="">Categoria</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select className="min-h-12 rounded-lg border border-white/[0.14] bg-[#17111e] px-4 text-sm text-white" onChange={(event) => updateFilter('level', event.target.value)} value={filters.level ?? ''}><option value="">Nível</option>{levels.map((level) => <option key={level} value={level}>{level}</option>)}</select><button className="min-h-12 rounded-lg bg-white px-5 text-sm font-bold text-[#140a21] transition hover:bg-[#eadbff]" type="submit">Buscar</button></form>
        <div className="mt-10 flex items-end justify-between gap-4"><h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Todos os cursos</h2><p className="text-sm text-white/45">{courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}</p></div>
        {courses.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{courses.map((course) => <CoursePoster course={course} key={course.id} />)}</div> : <div className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/55">Nenhum curso encontrado com esses filtros.</div>}
    </StudentLayout>;
}
