import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatRelative, SERVICE_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/utils';
import Link from 'next/link';
import type { Client, Service, Ticket, Session, Invoice, ConsumptionRecord } from '@/types';

const TABS = ['Perfil', 'Servicios', 'Tickets', 'Sesiones', 'Facturas', 'Iberinform'];

const SCORE_VARIANT: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
  A: 'green', 'A-': 'green', 'B+': 'blue', B: 'blue', 'B-': 'blue',
  'C+': 'orange', C: 'orange', 'C-': 'red',
};

const TICKET_PRIORITY_COLORS: Record<string, string> = {
  urgent: 'var(--red)',
  high: '#DD6B20',
  medium: 'var(--blue)',
  low: 'var(--grey-2)',
};

async function getClientData(id: string) {
  const sb = createServiceClient();
  const [clientRes, servicesRes, ticketsRes, sessionsRes, consumptionRes, invoicesRes] = await Promise.all([
    sb.from('clients').select('*').eq('id', id).single(),
    sb.from('services').select('*, products(id,name,family), suppliers(id,name)').eq('client_id', id).order('opened_at', { ascending: false }),
    sb.from('tickets').select('*, ticket_timeline(*), services!inner(client_id)').eq('services.client_id', id).order('created_at', { ascending: false }),
    sb.from('sessions').select('*, services!inner(client_id)').eq('services.client_id', id).order('scheduled_at', { ascending: false }),
    sb.from('consumption_history').select('*, products(id,name,family), suppliers(id,name)').eq('client_id', id).order('date', { ascending: false }),
    sb.from('invoices').select('*').eq('client_id', id).order('issued_at', { ascending: false }),
  ]);
  if (!clientRes.data) return null;
  return {
    client: clientRes.data as Client,
    services: (servicesRes.data ?? []) as Service[],
    tickets: (ticketsRes.data ?? []) as Ticket[],
    sessions: (sessionsRes.data ?? []) as Session[],
    consumption: (consumptionRes.data ?? []) as ConsumptionRecord[],
    invoices: (invoicesRes.data ?? []) as Invoice[],
  };
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: 'var(--grey-3)' }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: 'var(--blue-dark)' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--grey-3)' }}>{children}</div>;
}

const INVOICE_BADGE: Record<string, 'green' | 'orange' | 'red' | 'grey'> = {
  paid: 'green', sent: 'blue' as 'green', draft: 'grey', overdue: 'red', cancelled: 'grey',
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClientData(id);
  if (!data) notFound();

  const { client, services, tickets, sessions, consumption, invoices } = data;
  const openServices = services.filter(s => s.status !== 'closed');
  const openTickets = tickets.filter(t => !t.resolved_at);
  const upcomingSessions = sessions.filter(s => !s.completed && new Date(s.scheduled_at) >= new Date());

  return (
    <div>
      {/* Back */}
      <Link href="/clientes" className="text-xs font-medium mb-4 block" style={{ color: 'var(--blue)' }}>← Clientes</Link>

      {/* Header */}
      <div className="rounded-xl p-5 mb-6 text-white" style={{ background: 'var(--blue-dark)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold">{client.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--grey-2)' }}>
              {client.company_type ?? 'Laboratorio dental'}{client.city ? ` · ${client.city}` : ''}{client.country ? `, ${client.country}` : ''}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {client.iberinform_score && (
              <Badge variant={SCORE_VARIANT[client.iberinform_score] ?? 'grey'}>Iberinform: {client.iberinform_score}</Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.15)' }}>
          {[
            { val: openServices.length, lbl: 'Servicios abiertos' },
            { val: openTickets.length, lbl: 'Tickets abiertos' },
            { val: upcomingSessions.length, lbl: 'Sesiones próximas' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="text-center">
              <div className="text-2xl font-extrabold">{val}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-2)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Perfil */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Información general</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="NIF / NIPC" value={client.nif} />
            <InfoItem label="Tipo" value={client.company_type} />
            <InfoItem label="Responsable" value={client.contact_name} />
            <InfoItem label="Teléfono" value={client.contact_phone} />
            <InfoItem label="Email" value={client.contact_email} />
            <InfoItem label="Dirección" value={client.address} />
            {client.website && (
              <div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--grey-3)' }}>Web</div>
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline" style={{ color: 'var(--blue)' }}>
                  {client.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {consumption.length > 0 && (
            <>
              <SectionTitle>Historial de consumo</SectionTitle>
              <div className="space-y-2">
                {consumption.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-xs py-1.5 border-b" style={{ borderColor: 'var(--grey-1)' }}>
                    <span className="flex-1 font-medium" style={{ color: 'var(--blue-dark)' }}>
                      {(r.products as { name?: string } | null)?.name ?? '—'}
                    </span>
                    <span style={{ color: 'var(--grey-3)' }}>{formatDate(r.date)}</span>
                    <span className="font-bold" style={{ color: 'var(--blue)' }}>{formatCurrency(r.sale_price)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Servicios abiertos */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Servicios activos</SectionTitle>
          {openServices.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin servicios abiertos</p>
          ) : (
            <div className="space-y-2.5">
              {openServices.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--grey-0)' }}>
                  <span className="text-base">{s.type === 'commercial' ? '💼' : s.type === 'technical' ? '🔧' : '🎓'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--blue-dark)' }}>{s.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--grey-3)' }}>
                      {SERVICE_TYPE_LABELS[s.type]} · {formatRelative(s.opened_at)}
                    </div>
                  </div>
                  <Badge variant={s.status === 'closed' ? 'grey' : s.status === 'in_progress' ? 'blue' : 'orange'}>
                    {s.status === 'pending' ? 'Pendiente' : s.status === 'in_progress' ? 'En curso' : 'Cerrado'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Tickets técnicos */}
          {tickets.length > 0 && (
            <>
              <SectionTitle>Tickets técnicos</SectionTitle>
              <div className="space-y-2">
                {tickets.slice(0, 4).map(t => (
                  <div key={t.id} className="border-l-4 pl-3 py-1.5" style={{ borderColor: TICKET_PRIORITY_COLORS[t.priority] }}>
                    <div className="text-xs font-bold" style={{ color: 'var(--blue-dark)' }}>{t.issue}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--grey-3)' }}>
                      {PRIORITY_LABELS[t.priority]} · {t.resolved_at ? `Resuelto ${formatDate(t.resolved_at)}` : 'Abierto'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sesiones de formación */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Agenda de formación</SectionTitle>
          {sessions.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin sesiones programadas</p>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => {
                const d = new Date(s.scheduled_at);
                const past = d < new Date();
                return (
                  <div key={s.id} className="flex gap-3 items-start py-2 border-b last:border-0" style={{ borderColor: 'var(--grey-1)', opacity: past ? 0.65 : 1 }}>
                    <div className="text-white rounded-lg px-2 py-1.5 text-center flex-shrink-0" style={{ background: past ? 'var(--grey-3)' : 'var(--blue-dark)', minWidth: 46 }}>
                      <div className="text-lg font-extrabold leading-none">{d.getDate()}</div>
                      <div className="text-[10px] uppercase">{d.toLocaleDateString('es-ES', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'var(--blue-dark)' }}>{s.title}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--grey-3)' }}>
                        {d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {s.duration_min}min
                        {s.location ? ` · ${s.location}` : ''}
                        {s.completed ? ' ✓ Completada' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Facturas */}
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <SectionTitle>Facturas (Toconline)</SectionTitle>
          {!process.env.TOCONLINE_API_KEY ? (
            <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
              🔗 Conecta tu cuenta Toconline en la configuración de variables de entorno para ver facturas aquí.
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--grey-3)' }}>Sin facturas</p>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--grey-1)' }}>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--blue-dark)' }}>{inv.number ?? inv.toconline_id}</div>
                    <div className="text-[11px]" style={{ color: 'var(--grey-3)' }}>{formatDate(inv.issued_at)}</div>
                  </div>
                  <Badge variant={INVOICE_BADGE[inv.status ?? 'draft'] ?? 'grey'}>
                    {inv.status === 'paid' ? 'Pagada' : inv.status === 'sent' ? 'Enviada' : inv.status === 'overdue' ? 'Vencida' : inv.status ?? '—'}
                  </Badge>
                  <div className="text-sm font-bold" style={{ color: 'var(--blue-dark)' }}>{formatCurrency(inv.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
