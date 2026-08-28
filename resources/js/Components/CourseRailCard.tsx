import CourseCard from '@/Components/CourseCard';

type Course = { title: string; slug: string; thumbnailPath?: string | null; category?: string | null; level?: string | null; lessonCount: number; progress: number; };

export default function CourseRailCard({ course }: { course: Course }) {
    return <CourseCard course={course} variant="rail" />;
}
