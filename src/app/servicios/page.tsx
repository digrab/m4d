import { createServiceClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/utils';
import type { Service } from '@/types';
import Link from 'next/link';

const TYPE_CONFIG = {
  commercial: { icon: '💼', label: 'Comercial', badge: 'blue' as const, border: 'var(--blue)' },
  technical:  { icon: '🔧', label: 'Técnico',   badge: 'orange' as const, border: '#DD6B20' },
  training:   { icon: '🎓', label: 'Formación', badge: 'teal' as const,   border: 'var(--teal)' },
};

const COLS = [
  { key: 'pending',     label: 'Pendiente',   color: 'var(--grey-3)' },
  { key: 'in_progress', label: 'En progreso', color: 'var(--blue)' },
  { key: 'closed',      label: 'Cerrado',     color: '#276749' },
] as const;

async function getServices(): Promise<Service[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from('services')
      .select('*, clients(id,name), products(id,name,family), suppliers(id,name)')
      .order('opened_at', { ascending: false });
    return data ?? [];
  } catch { return []; }
}

export default async function ServiciosPage() {
  const services = await getServices();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-dark)' }}>Servicios</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--grey-3)' }}>
        {services.filter(s => s.status !== 'closed').length} servicios abiertos
      </p>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {Object.entries(TYPE_CONFIG).map(([type, { icon, label, badge }]) => (
          <Badge key={type} variant={badge}>{icon} {label}</Badge>
        ))}
        <Link
          href="/servicios/nuevo"
          className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-white rounded-xl px-4 py-2 transition-colors"
          style={{ background: 'var(--teal)' }}
        >
          + Nuevo servicio
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map(({ key, label, color }) => {
          const col = services.filter(s => s.status === key);
          return (
            <div key={key} className="rounded-xl p-4" style={{ background: 'var(--grey-0)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color }}>
                {label}
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'var(--grey-1)', color: 'var(--grey-3)' }}>
                  {col.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {col.map(s => {
                  const cfg = TYPE_CONFIG[s.type];
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-xl p-3 border-l-4 cursor-pointer transition-shadow hover:shadow-md"
                      style={{ borderLeftColor: cfg.border, boxShadow: 'var(--shadow)' }}
                    >
                      <div className="text-xs font-bold truncate mb-1" style={{ color: 'var(--blue-dark)' }}>
                        {(s.clients as { name?: string } | null)?.name}
                      </div>
                      <div className="text-xs mb-2 truncate" style={{ color: 'var(--grey-3)' }}>{s.title}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant={cfg.badge} className="text-[10px]">{cfg.icon} {cfg.label}</Badge>
                        <span className="text-[11px]" style={{ color: 'var(--grey-3)' }}>{formatRelative(s.opened_at)}</span>
                      </div>
                    </div>
                  );
                })}
                {col.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--grey-2)' }}>Vacío</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
