import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const sb = createServiceClient();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

  const [clientsRes, servicesRes, sessionsRes, consumptionRes] = await Promise.all([
    sb.from('clients').select('id', { count: 'exact' }),
    sb.from('services').select('id, type, status'),
    sb.from('sessions').select('id').gte('scheduled_at', new Date().toISOString()).lte('scheduled_at', new Date(Date.now() + 30 * 86400000).toISOString()),
    sb.from('consumption_history').select('client_id, supplier_id, sale_price, date').gte('date', yearStart),
  ]);

  const consumption = consumptionRes.data ?? [];
  const services = servicesRes.data ?? [];

  const ytd = consumption.reduce((s: number, r: { sale_price?: number | null }) => s + (r.sale_price ?? 0), 0);

  // By client
  const byClient: Record<string, number> = {};
  for (const r of consumption) {
    if (r.client_id) byClient[r.client_id] = (byClient[r.client_id] ?? 0) + (r.sale_price ?? 0);
  }

  // By supplier
  const bySupplier: Record<string, number> = {};
  for (const r of consumption) {
    if (r.supplier_id) bySupplier[r.supplier_id] = (bySupplier[r.supplier_id] ?? 0) + (r.sale_price ?? 0);
  }

  // By service type
  const byType: Record<string, number> = { commercial: 0, technical: 0, training: 0 };
  for (const s of services) byType[s.type] = (byType[s.type] ?? 0) + 1;

  // Monthly (last 12)
  const monthly: Record<string, number> = {};
  for (const r of consumption) {
    const key = r.date.slice(0, 7);
    monthly[key] = (monthly[key] ?? 0) + (r.sale_price ?? 0);
  }

  return Response.json({
    kpis: {
      clients: clientsRes.count ?? 0,
      open_services: services.filter((s: { status: string }) => s.status !== 'closed').length,
      upcoming_sessions: sessionsRes.data?.length ?? 0,
      ytd,
    },
    by_client: byClient,
    by_supplier: bySupplier,
    by_type: byType,
    monthly,
  });
}
