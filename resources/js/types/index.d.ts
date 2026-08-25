export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR';
    phone?: string | null;
    job_title?: string | null;
    company?: string | null;
    business_segment?: string | null;
    city?: string | null;
    state?: string | null;
    avatar_path?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
