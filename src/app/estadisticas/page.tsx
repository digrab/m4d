import { createServiceClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import type { ReplenishmentAlert, Lead } from '@/types';

async function getData() {
  try {
    const sb = createServiceClient();
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const [consumptionRes, clientsRes, suppliersRes, servicesRes, leadsRes] = await Promise.all([
      sb.from('consumption_history').select('client_id, supplier_id, sale_price, date').gte('date', yearStart),
      sb.from('clients').select('id, name'),
      sb.from('suppliers').select('id, name'),
      sb.from('services').select('type'),
      sb.from('leads').select('*').eq('status', 'new').order('discovered_at', { ascending: false }).limit(5),
    ]);

    const consumption = consumptionRes.data ?? [];
    const clients = clientsRes.data ?? [];
    const suppliers = suppliersRes.data ?? [];

    const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));
    const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));

    const byClient: Record<string, number> = {};
    const bySupplier: Record<string, number> = {};
    for (const r of consumption) {
      if (r.client_id) byClient[r.client_id] = (byClient[r.client_id] ?? 0) + (r.sale_price ?? 0);
      if (r.supplier_id) bySupplier[r.supplier_id] = (bySupplier[r.supplier_id] ?? 0) + (r.sale_price ?? 0);
    }

    const byType: Record<string, number> = { commercial: 0, technical: 0, training: 0 };
    for (const s of servicesRes.data ?? []) byType[s.type] = (byType[s.type] ?? 0) + 1;

    const ytd = consumption.reduce((s, r) => s + (r.sale_price ?? 0), 0);

    return {
      ytd,
      byClient: Object.entries(byClient).map(([id, v]) => ({ name: clientMap[id] ?? id, value: v })).sort((a, b) => b.value - a.value),
      bySupplier: Object.entries(bySupplier).map(([id, v]) => ({ name: supplierMap[id] ?? id, value: v })).sort((a, b) => b.value - a.value),
      byType,
      leads: leadsRes.data ?? [],
    };
  } catch {
    return { ytd: 0, byClient: [], bySupplier: [], byType: {}, leads: [] };
  }
}

function BarRow({ name, value, max }: { name: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <div className="text-xs truncate flex-shrink-0 w-36" style={{ color: 'var(--grey-4)' }}>{name}</div>
      <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--grey-1)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--blue), var(--teal))' }} />
      </div>
      <div className="text-xs font-bold flex-shrink-0 w-16 text-right" style={{ color: 'var(--blue-dark)' }}>{formatCurrency(value)}</div>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = { commercial: '💼 Comercial', technical: '🔧 Técnico', training: '🎓 Formación' };

export default async function EstadisticasPage() {
  const { ytd, byClient, bySupplier, byType, leads } = await getData();
  const maxClient = byClient[0]?.value ?? 1;
  const maxSupplier = bySupplier[0]?.value ?? 1;
  const totalServices = Object.values(byType).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-dark)' }}>Estadísticas</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--grey-3)' }}>Resumen del año {new Date().getFullYear()}</p>

      {/* Leads alert */}
      {leads.length > 0 && (
        <div className="rounded-xl p-4 mb-6 border-l-4" style={{ background: 'var(--teal-light)', borderLeftColor: 'var(--teal)' }}>
          <div className="text-sm font-bold mb-2" style={{ color: '#007A6E' }}>🔍 {leads.length} nuevos laboratorios detectados</div>
          <div className="space-y-1">
            {leads.map((l: Lead) => (
              <div key={l.id} className="text-xs flex items-center gap-2" style={{ color: '#007A6E' }}>
                <span className="font-semibold">{l.name}</span>
                {l.city && <span style={{ color: 'var(--teal)' }}>· {l.city}</span>}
                {l.website && <a href={l.website} target="_blank" rel="noopener noreferrer" className="underline">web ↗</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--blue-dark)' }}>
            Facturación por cliente · YTD: {formatCurrency(ytd)}
          </div>
          {byClient.length === 0
            ? <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin datos de consumo aún</p>
            : byClient.map(({ name, value }) => <BarRow key={name} name={name} value={value} max={maxClient} />)}
        </div>

        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--blue-dark)' }}>Facturación por proveedor</div>
          {bySupplier.length === 0
            ? <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin datos de consumo aún</p>
            : bySupplier.map(({ name, value }) => <BarRow key={name} name={name} value={value} max={maxSupplier} />)}

          <div className="text-sm font-bold mt-6 mb-3" style={{ color: 'var(--blue-dark)' }}>Servicios por tipo</div>
          {Object.entries(byType).map(([type, count]) => (
            <div key={type} className="flex items-center gap-3 mb-2">
              <div className="text-xs w-32" style={{ color: 'var(--grey-4)' }}>{TYPE_LABELS[type]}</div>
              <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--grey-1)' }}>
                <div className="h-full rounded-full" style={{ width: totalServices > 0 ? `${(count / totalServices) * 100}%` : '0%', background: type === 'commercial' ? 'var(--blue)' : type === 'technical' ? '#DD6B20' : 'var(--teal)' }} />
              </div>
              <div className="text-xs font-bold w-6 text-right" style={{ color: 'var(--blue-dark)' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
