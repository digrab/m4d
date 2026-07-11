'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { FAMILY_LABELS } from '@/lib/utils';
import type { Supplier } from '@/types';

const FAMILY_ICONS: Record<string, string> = {
  machines: '⚙️',
  software: '💾',
  consumables: '🦴',
};

const SUPPLIER_EMOJIS: Record<string, string> = {
  'Mesa Italia': '🇮🇹',
  'Paragon': '💎',
  'XTCera': '🦴',
  'Dof Lab': '⚗️',
  'Hass bio': '🧬',
};

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
  const families = supplier.supplier_families?.map(f => f.family) ?? [];

  return (
    <div
      className="bg-white rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-[var(--blue-light)] relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow)' }}
      onClick={() => router.push(`/proveedores/${supplier.id}`)}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      <div className="h-1 card-accent absolute top-0 left-0 right-0" />
      <div className="p-5 pt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--blue-light)' }}>
            {SUPPLIER_EMOJIS[supplier.name] ?? '🏭'}
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: 'var(--blue-dark)' }}>{supplier.name}</div>
            <div className="text-[11px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--grey-3)' }}>
              {supplier.country ?? 'Fabricante'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {families.map(f => (
            <Badge key={f} variant={f === 'consumables' ? 'teal' : 'blue'}>
              {FAMILY_ICONS[f]} {FAMILY_LABELS[f]}
            </Badge>
          ))}
        </div>

        <div className="flex gap-4 pt-3 border-t" style={{ borderColor: 'var(--grey-1)' }}>
          <div className="text-center">
            <div className="text-lg font-extrabold" style={{ color: 'var(--blue-dark)' }}>{supplier._count?.products ?? 0}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-3)' }}>Productos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold" style={{ color: 'var(--blue-dark)' }}>{supplier._count?.services ?? 0}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-3)' }}>Servicios</div>
          </div>
        </div>
      </div>
    </div>
  );
}
