import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, FAMILY_LABELS } from '@/lib/utils';
import Link from 'next/link';
import type { Supplier, Product, Service } from '@/types';

const FAMILY_ICONS: Record<string, string> = { machines: '⚙️', software: '💾', consumables: '🦴' };
const FAMILY_BADGE: Record<string, 'blue' | 'teal'> = { machines: 'blue', software: 'blue', consumables: 'teal' };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--grey-3)' }}>{children}</div>;
}

async function getSupplierData(id: string) {
  const sb = createServiceClient();
  const [supplierRes, productsRes, servicesRes] = await Promise.all([
    sb.from('suppliers').select('*, supplier_families(family)').eq('id', id).single(),
    sb.from('products').select('*').eq('supplier_id', id).order('family').order('name'),
    sb.from('services').select('*, clients(id,name), products(id,name)').eq('supplier_id', id).neq('status', 'closed').order('opened_at', { ascending: false }),
  ]);
  if (!supplierRes.data) return null;
  return {
    supplier: supplierRes.data as Supplier,
    products: (productsRes.data ?? []) as Product[],
    services: (servicesRes.data ?? []) as Service[],
  };
}

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getSupplierData(id);
  if (!data) notFound();

  const { supplier, products, services } = data;
  const families = supplier.supplier_families?.map(f => f.family) ?? [];

  return (
    <div>
      <Link href="/proveedores" className="text-xs font-medium mb-4 block" style={{ color: 'var(--blue)' }}>← Proveedores</Link>

      {/* Header */}
      <div className="rounded-xl p-5 mb-6 text-white" style={{ background: 'var(--blue-dark)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold">{supplier.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--grey-2)' }}>
              Fabricante{supplier.country ? ` · ${supplier.country}` : ''}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {families.map(f => (
              <Badge key={f} variant={FAMILY_BADGE[f] ?? 'grey'}>{FAMILY_ICONS[f]} {FAMILY_LABELS[f]}</Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.15)' }}>
          <div className="text-center">
            <div className="text-2xl font-extrabold">{products.length}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-2)' }}>Productos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold">{services.length}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-2)' }}>Servicios activos</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Info general */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Información</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              ['País', supplier.country],
              ['Contacto', supplier.contact_name],
              ['Email', supplier.contact_email],
              ['Teléfono', supplier.contact_phone],
            ].map(([label, value]) => value ? (
              <div key={label as string}>
                <div className="text-xs mb-0.5" style={{ color: 'var(--grey-3)' }}>{label}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--blue-dark)' }}>{value}</div>
              </div>
            ) : null)}
            {supplier.website && (
              <div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--grey-3)' }}>Web</div>
                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline" style={{ color: 'var(--blue)' }}>
                  {supplier.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          <SectionTitle>Familias de producto</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {families.map(f => (
              <span key={f} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                {FAMILY_ICONS[f]} {FAMILY_LABELS[f]}
              </span>
            ))}
          </div>
        </div>

        {/* Catálogo */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Catálogo de productos ({products.length})</SectionTitle>
          {products.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin productos. Añade el primero.</p>
          ) : (
            <div className="space-y-2.5">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--grey-0)' }}>
                  <span className="text-xl">{FAMILY_ICONS[p.family]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--blue-dark)' }}>{p.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--grey-3)' }}>
                      {FAMILY_LABELS[p.family]}{p.reference ? ` · ${p.reference}` : ''}
                    </div>
                  </div>
                  {p.price_ref && (
                    <div className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--blue)' }}>
                      {formatCurrency(p.price_ref)}{p.unit !== 'unit' ? `/${p.unit}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Servicios activos */}
        {services.length > 0 && (
          <div className="bg-white rounded-xl p-5 lg:col-span-2" style={{ boxShadow: 'var(--shadow)' }}>
            <SectionTitle>Servicios activos relacionados</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {services.map(s => (
                <div key={s.id} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: 'var(--grey-0)' }}>
                  <span>{s.type === 'commercial' ? '💼' : s.type === 'technical' ? '🔧' : '🎓'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--blue-dark)' }}>{s.title}</div>
                    <div className="text-[11px]" style={{ color: 'var(--grey-3)' }}>
                      {(s.clients as { name?: string } | null)?.name}
                    </div>
                  </div>
                  <Badge variant={s.status === 'in_progress' ? 'blue' : 'orange'}>
                    {s.status === 'pending' ? 'Pendiente' : 'En curso'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
