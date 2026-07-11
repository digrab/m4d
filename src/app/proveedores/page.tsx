import { createServiceClient } from '@/lib/supabase/server';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { AddEntityButton } from '@/components/ui/AddEntityButton';
import type { Supplier } from '@/types';

async function getSuppliers(): Promise<Supplier[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from('suppliers')
      .select('*, supplier_families(family)')
      .order('name');

    if (!data) return [];

    const ids = data.map(s => s.id);
    const [{ data: products }, { data: services }] = await Promise.all([
      sb.from('products').select('id, supplier_id').in('supplier_id', ids),
      sb.from('services').select('id, supplier_id').in('supplier_id', ids).neq('status', 'closed'),
    ]);

    return data.map(s => ({
      ...s,
      _count: {
        products: (products || []).filter(p => p.supplier_id === s.id).length,
        services: (services || []).filter(sv => sv.supplier_id === s.id).length,
      },
    }));
  } catch {
    return [];
  }
}

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-dark)' }}>Proveedores</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--grey-3)' }}>{suppliers.length} proveedores · 3 familias de producto</p>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar proveedor..."
          className="flex-1 max-w-xs text-sm border rounded-xl px-4 py-2.5 outline-none focus:border-[var(--blue)] bg-white"
          style={{ borderColor: 'var(--grey-1)', boxShadow: 'var(--shadow)' }}
        />
        <AddEntityButton type="supplier" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {suppliers.map(s => <SupplierCard key={s.id} supplier={s} />)}
        {suppliers.length === 0 && (
          <p className="col-span-full text-center py-12 text-sm" style={{ color: 'var(--grey-3)' }}>
            Sin proveedores. Añade el primero →
          </p>
        )}
      </div>
    </div>
  );
}
