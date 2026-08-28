import CoursePoster from '@/Components/CoursePoster';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Course = { id: number; title: string; slug: string; thumbnailPath?: string | null; category?: string | null; level?: string | null; lessonCount: number; enrolled: boolean; progress: number; status: 'available' | 'not_started' | 'in_progress' | 'completed' };
type Props = { courses: Course[]; filters: { search?: string; category?: string; level?: string }; categories: string[]; levels: string[] };

export default function Index({ courses, filters, categories, levels }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [level, setLevel] = useState(filters.level ?? '');
    const hasActiveFilters = Boolean(search || category || level);
    const apply = (event: FormEvent) => { event.preventDefault(); router.get('/courses', { search: search || undefined, category: category || undefined, level: level || undefined }, { preserveState: true, replace: true }); };
    const updateFilter = (field: 'category' | 'level', value: string) => {
        const nextCategory = field === 'category' ? value : category;
        const nextLevel = field === 'level' ? value : level;
        field === 'category' ? setCategory(value) : setLevel(value);
        router.get('/courses', { search: search || undefined, category: nextCategory || undefined, level: nextLevel || undefined }, { preserveState: true, replace: true });
    };
    const clearFilters = () => { setSearch(''); setCategory(''); setLevel(''); router.get('/courses', {}, { preserveState: true, replace: true }); };

    return <StudentLayout><Head title="Explorar cursos" />
        <section className="relative overflow-hidden border-b border-white/[0.08] pb-10 sm:pb-14"><span aria-hidden className="absolute right-0 top-0 h-64 w-64 rotate-45 border border-[#9347dd]/35" /><div className="relative max-w-3xl"><h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Explore</h1><p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">Encontre conteúdos para avançar sua gestão.</p></div></section>
        <form className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]" onSubmit={apply}><label className="sr-only" htmlFor="course-search">Buscar cursos</label><input className="min-h-12 rounded-lg border border-white/[0.14] bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/35 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" id="course-search" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cursos" value={search} /><label className="sr-only" htmlFor="course-category">Categoria</label><select className="min-h-12 rounded-lg border border-white/[0.14] bg-[#17111e] px-4 text-sm text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" id="course-category" onChange={(event) => updateFilter('category', event.target.value)} value={category}><option value="">Categoria</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><label className="sr-only" htmlFor="course-level">Nível</label><select className="min-h-12 rounded-lg border border-white/[0.14] bg-[#17111e] px-4 text-sm text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" id="course-level" onChange={(event) => updateFilter('level', event.target.value)} value={level}><option value="">Nível</option>{levels.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="min-h-12 rounded-lg bg-white px-5 text-sm font-bold text-[#140a21] transition hover:bg-[#eadbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070d]" type="submit">Buscar</button></form>
        <p className="mt-3 text-xs text-white/45">Categoria e nível atualizam automaticamente. Use Buscar para aplicar um termo.</p>
        {hasActiveFilters && <div className="mt-3"><button className="text-sm font-bold text-[#c28aff] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c28aff]" onClick={clearFilters} type="button">Limpar filtros</button></div>}
        <div className="mt-10 flex items-end justify-between gap-4"><h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Todos os cursos</h2><p className="text-sm text-white/45">{courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}</p></div>
        {courses.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{courses.map((course) => <CoursePoster course={course} key={course.id} />)}</div> : <div className="mt-8 border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/55">Nenhum curso encontrado com esses filtros.</div>}
    </StudentLayout>;
}
