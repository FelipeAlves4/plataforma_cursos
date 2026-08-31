import { KeyboardEvent, useMemo, useState } from 'react';

type Student = { id: number; name: string; email: string };

type StudentComboboxProps = {
    students: Student[];
    value: string;
    onChange: (studentId: string) => void;
    error?: string;
};

export default function StudentCombobox({ students, value, onChange, error }: StudentComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const selectedStudent = students.find((student) => student.id === Number(value));
    const matchingStudents = useMemo(() => {
        const term = query.trim().toLocaleLowerCase('pt-BR');

        if (term === '') {
            return students;
        }

        return students.filter((student) => `${student.name} ${student.email}`.toLocaleLowerCase('pt-BR').includes(term));
    }, [query, students]);

    const selectStudent = (student: Student): void => {
        onChange(String(student.id));
        setQuery('');
        setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.min(index + 1, Math.max(matchingStudents.length - 1, 0)));
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.max(index - 1, 0));
        }

        if (event.key === 'Enter' && open && matchingStudents[activeIndex]) {
            event.preventDefault();
            selectStudent(matchingStudents[activeIndex]);
        }

        if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    return <div className="admin-field relative">
        <label htmlFor="student-search">Aluno</label>
        <input aria-activedescendant={open && matchingStudents[activeIndex] ? `student-${matchingStudents[activeIndex].id}` : undefined} aria-autocomplete="list" aria-controls="student-options" aria-expanded={open} autoComplete="off" id="student-search" onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={handleKeyDown} placeholder="Buscar por nome ou e-mail" role="combobox" value={query} />
        {open && <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1A1527] p-1 shadow-2xl shadow-black/30" id="student-options" role="listbox">
            {matchingStudents.length > 0 ? matchingStudents.map((student, index) => <li aria-selected={student.id === Number(value)} className={`cursor-pointer rounded-lg px-3 py-2.5 ${index === activeIndex ? 'bg-[#6429AA]/30' : 'hover:bg-white/[0.06]'}`} id={`student-${student.id}`} key={student.id} onMouseDown={(event) => { event.preventDefault(); selectStudent(student); }} role="option"><strong className="block text-sm text-[#F8F7FB]">{student.name}</strong><span className="mt-0.5 block text-xs text-[#9D93B8]">{student.email}</span></li>) : <li className="px-3 py-3 text-sm text-[#9D93B8]">Nenhum aluno encontrado.</li>}
        </ul>}
        {selectedStudent && <div className="mt-3 rounded-xl border border-[#9347DD]/30 bg-[#6429AA]/10 px-3 py-2.5"><strong className="block text-sm text-[#F8F7FB]">{selectedStudent.name}</strong><span className="mt-0.5 block text-xs text-[#C9C2D9]">{selectedStudent.email}</span></div>}
        {error && <small className="mt-2 block text-rose-300">{error}</small>}
    </div>;
}
