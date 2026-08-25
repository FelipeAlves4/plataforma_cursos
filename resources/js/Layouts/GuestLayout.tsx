import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-ink px-5 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <span className="text-2xl font-black tracking-tight text-white">ASEX <span className="font-medium text-brand-300">Educação</span></span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white px-6 py-7 shadow-2xl sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
