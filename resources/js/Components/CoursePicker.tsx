import { ChangeEvent, useMemo, useState } from 'react';

type Course = { id: number; title: string; category?: string | null };

type CoursePickerProps = {
    courses: Course[];
    selectedCourseIds: number[];
    onToggle: (courseId: number) => void;
    error?: string;
};

export default function CoursePicker({ courses, selectedCourseIds, onToggle, error }: CoursePickerProps) {
    const [search, setSearch] = useState('');
    const visibleCourses = useMemo(() => {
        const term = search.trim().toLocaleLowerCase('pt-BR');

        if (term === '') {
            return courses;
        }

        return courses.filter((course) => `${course.title} ${course.category ?? ''}`.toLocaleLowerCase('pt-BR').includes(term));
    }, [courses, search]);

    return <fieldset className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <legend className="text-sm font-black text-[#F8F7FB]">Cursos incluídos</legend>
                <p className="mt-1 text-sm leading-6 text-[#9D93B8]">Os cursos publicados selecionados serão copiados para cada oferta.</p>
            </div>
            <span className="rounded-full bg-[#6429AA]/15 px-3 py-1 text-xs font-bold text-[#D8B4FE]">{selectedCourseIds.length} selecionado{selectedCourseIds.length === 1 ? '' : 's'}</span>
        </div>
        <label className="admin-field mt-5 block">
            <span className="sr-only">Buscar curso</span>
            <input onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="Buscar curso ou categoria" type="search" value={search} />
        </label>
        <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#100C18]">
            {visibleCourses.length > 0 ? visibleCourses.map((course) => {
                const selected = selectedCourseIds.includes(course.id);

                return <label className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition ${selected ? 'bg-[#6429AA]/20' : 'hover:bg-white/[0.035]'}`} key={course.id}>
                    <input checked={selected} className="h-4 w-4 rounded border-white/30 bg-transparent text-[#9347DD] focus:ring-[#9347DD]" onChange={() => onToggle(course.id)} type="checkbox" />
                    <span className="min-w-0"><strong className="block truncate text-sm text-[#F8F7FB]">{course.title}</strong>{course.category && <small className="mt-0.5 block text-xs text-[#9D93B8]">{course.category}</small>}</span>
                </label>;
            }) : <p className="px-4 py-5 text-sm text-[#9D93B8]">Nenhum curso encontrado.</p>}
        </div>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </fieldset>;
}
