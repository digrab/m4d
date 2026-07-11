import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'M4D — Business Management',
  description: 'Plataforma de gestión para distribución en sector dental',
  manifest: '/manifest.json',
  themeColor: '#0A2540',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: 'var(--grey-0)' }}>
        <Header />
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
