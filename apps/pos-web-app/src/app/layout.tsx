// ============================================================
// Root Layout — Server Component
// File: apps/pos-web-app/src/app/layout.tsx
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { cn }        from '@/lib/utils';
import { Providers } from './providers';

const geist     = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
    title:       'POS System',
    description: 'POS Reports & Analytics',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn(geist.variable, geistMono.variable)}>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}