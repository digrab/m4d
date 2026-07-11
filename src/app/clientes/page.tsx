import { createServiceClient } from '@/lib/supabase/server';
import { ClientCard } from '@/components/clients/ClientCard';
import { AddEntityButton } from '@/components/ui/AddEntityButton';
import type { Client } from '@/types';

async function getClients(): Promise<Client[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from('clients').select('*').order('name');
    if (!data) return [];

    const ids = data.map(c => c.id);
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const [{ data: services }, { data: tickets }, { data: consumption }] = await Promise.all([
      sb.from('services').select('id, client_id').in('client_id', ids).neq('status', 'closed'),
      sb.from('tickets').select('id, service_id, services!inner(client_id)').in('services.client_id', ids),
      sb.from('consumption_history').select('client_id, sale_price').in('client_id', ids).gte('date', yearStart),
    ]);

    return data.map(c => ({
      ...c,
      _count: {
        services: (services || []).filter(s => s.client_id === c.id).length,
        tickets: (tickets || []).filter(t => (t.services as { client_id: string } | null)?.client_id === c.id).length,
      },
      ytd_revenue: (consumption || [])
        .filter(r => r.client_id === c.id)
        .reduce((s, r) => s + (r.sale_price || 0), 0),
    }));
  } catch {
    return [];
  }
}

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-dark)' }}>Clientes</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--grey-3)' }}>{clients.length} clientes activos</p>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="flex-1 max-w-xs text-sm border rounded-xl px-4 py-2.5 outline-none focus:border-[var(--blue)] bg-white"
          style={{ borderColor: 'var(--grey-1)', boxShadow: 'var(--shadow)' }}
        />
        <AddEntityButton type="client" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clients.map(c => <ClientCard key={c.id} client={c} />)}
        {clients.length === 0 && (
          <p className="col-span-full text-center py-12 text-sm" style={{ color: 'var(--grey-3)' }}>
            Sin clientes. Añade el primero →
          </p>
        )}
      </div>
    </div>
  );
}
