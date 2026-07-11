'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/proveedores', label: 'Proveedores' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/estadisticas', label: 'Estadísticas' },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header style={{ background: 'var(--blue-dark)' }} className="sticky top-0 z-50 flex items-center gap-0 px-5 h-14 shadow-lg">
      <Link href="/dashboard" className="font-extrabold text-xl tracking-widest mr-7 flex-shrink-0" style={{ color: 'var(--teal)' }}>
        M<span style={{ color: 'white' }}>4</span>D
      </Link>
      <nav className="hidden md:flex gap-0 flex-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="px-4 h-14 flex items-center text-sm font-medium transition-colors border-b-[3px]"
              style={{
                color: active ? 'var(--teal)' : 'var(--grey-2)',
                borderBottomColor: active ? 'var(--teal)' : 'transparent',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--blue)' }}
        >
          RA
        </div>
      </div>
    </header>
  );
}
