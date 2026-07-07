import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Ryzera POS',
    description: 'POS System',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className="h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
        </body>
        </html>
    );
}