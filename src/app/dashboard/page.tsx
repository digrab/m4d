import { createServiceClient } from '@/lib/supabase/server';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { LayoutDashboard, Users, Wrench, CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

async function getKpis() {
  try {
    const sb = createServiceClient();
    const [clientsRes, servicesRes, sessionsRes, consumptionRes] = await Promise.all([
      sb.from('clients').select('id', { count: 'exact' }),
      sb.from('services').select('id, type, status, title, opened_at, clients(name)').neq('status', 'closed').order('opened_at', { ascending: false }),
      sb.from('sessions').select('id, title, scheduled_at, services(clients(name))').gte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(5),
      sb.from('consumption_history').select('sale_price').gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]),
    ]);
    const ytd = (consumptionRes.data || []).reduce((s, r) => s + (r.sale_price || 0), 0);
    return {
      clients: clientsRes.count || 0,
      openServices: (servicesRes.data || []).length,
      upcomingSessions: (sessionsRes.data || []),
      recentServices: (servicesRes.data || []).slice(0, 5),
      ytd,
    };
  } catch {
    return { clients: 0, openServices: 0, upcomingSessions: [], recentServices: [], ytd: 0 };
  }
}

const SERVICE_COLORS: Record<string, string> = {
  commercial: 'var(--blue)',
  technical: '#DD6B20',
  training: 'var(--teal)',
};
const SERVICE_ICONS: Record<string, string> = {
  commercial: '💼',
  technical: '🔧',
  training: '🎓',
};

export default async function DashboardPage() {
  const { clients, openServices, upcomingSessions, recentServices, ytd } = await getKpis();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-dark)' }}>Dashboard</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--grey-3)' }}>
        {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clientes activos', value: clients, icon: Users, color: 'var(--blue)' },
          { label: 'Servicios abiertos', value: openServices, icon: Wrench, color: '#DD6B20' },
          { label: 'Sesiones próximas', value: upcomingSessions.length, icon: CalendarDays, color: 'var(--teal)' },
          { label: 'Facturado YTD', value: formatCurrency(ytd), icon: TrendingUp, color: 'var(--blue)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm text-center" style={{ boxShadow: 'var(--shadow)' }}>
            <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--blue-dark)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--grey-3)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Actividad reciente */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="text-sm font-bold mb-4 flex items-center justify-between" style={{ color: 'var(--blue-dark)' }}>
            Servicios abiertos
            <Link href="/servicios" className="text-xs font-medium" style={{ color: 'var(--blue)' }}>Ver todos →</Link>
          </div>
          {recentServices.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin servicios abiertos</p>
          ) : recentServices.map((s: { id: string; type: string; title: string; opened_at: string; clients?: { name: string } | null }) => (
            <div key={s.id} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--grey-1)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--blue-light)' }}>
                {SERVICE_ICONS[s.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--blue-dark)' }}>{s.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--grey-3)' }}>
                  {(s.clients as { name?: string } | null)?.name} · {formatRelative(s.opened_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Próximas sesiones */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--blue-dark)' }}>Próximas sesiones</div>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin sesiones programadas</p>
          ) : upcomingSessions.map((s: { id: string; title: string; scheduled_at: string; services?: { clients?: { name: string } | null } | null }) => {
            const d = new Date(s.scheduled_at);
            return (
              <div key={s.id} className="flex gap-3 items-start py-2 border-b last:border-0" style={{ borderColor: 'var(--grey-1)' }}>
                <div className="text-white rounded-lg px-2.5 py-1.5 text-center flex-shrink-0" style={{ background: 'var(--blue-dark)', minWidth: 48 }}>
                  <div className="text-lg font-extrabold leading-none">{d.getDate()}</div>
                  <div className="text-[10px] uppercase tracking-wide">{d.toLocaleDateString('es-ES', { month: 'short' })}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--blue-dark)' }}>{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--grey-3)' }}>
                    {d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    {s.services && (s.services as { clients?: { name?: string } | null }).clients?.name ? ` · ${(s.services as { clients?: { name?: string } | null }).clients?.name}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
