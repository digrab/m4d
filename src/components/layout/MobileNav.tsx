'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Wrench, BarChart3 } from 'lucide-react';

const TABS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', Icon: Users },
  { href: '/proveedores', label: 'Proveedores', Icon: Building2 },
  { href: '/servicios', label: 'Servicios', Icon: Wrench },
  { href: '/estadisticas', label: 'Stats', Icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: 'var(--blue-dark)', borderColor: 'rgba(255,255,255,.1)' }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
            style={{ color: active ? 'var(--teal)' : 'var(--grey-3)' }}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
