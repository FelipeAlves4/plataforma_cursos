import BrandLogo from '@/Components/BrandLogo';
import PortalBackdrop from '@/Components/PortalBackdrop';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="portal-auth">
            <PortalBackdrop />
            <header className="portal-auth-header"><BrandLogo href="/" className="h-8 w-auto sm:h-9" /></header>
            <main className="portal-auth-main portal-reveal"><aside className="portal-auth-intro" aria-hidden="true"><p>Conhecimento que abre novos horizontes.</p></aside><section className="portal-auth-card">{children}</section></main>
        </div>
    );
}
