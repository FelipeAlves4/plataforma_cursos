import CourseCard from '@/Components/CourseCard';

type Course = {
    title: string;
    slug: string;
    thumbnailPath?: string | null;
    category?: string | null;
    level?: string | null;
    progress: number;
    lessonCount: number;
    enrolled?: boolean;
};

export default function CoursePoster({ course }: { course: Course }) {
    return <CourseCard course={course} variant="poster" />;
}
