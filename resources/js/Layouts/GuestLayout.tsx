import BrandLogo from '@/Components/BrandLogo';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-ink px-5 py-8 sm:justify-center">
            <BrandLogo href="/" className="h-16 w-56" />
            <div className="mt-7 w-full overflow-hidden rounded-2xl border border-white/10 bg-white px-6 py-7 shadow-2xl sm:max-w-md sm:px-8">
                {children}
            </div>
        </div>
    );
}
