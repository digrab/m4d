'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Client } from '@/types';

const SCORE_VARIANT: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
  A: 'green', 'A-': 'green', 'B+': 'blue', B: 'blue', 'B-': 'blue',
  'C+': 'orange', C: 'orange', 'C-': 'red',
};

const CLIENT_EMOJIS: Record<string, string> = {
  'DSL Dental Solution Lab': '🦷',
  'The Lumina': '✨',
  'Infinidente': '∞',
  'Dental Corgo': '🔬',
  'DMT - Dental Milling Technology': '⚙️',
  'PMF': '🏅',
};

export function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const scoreVariant = client.iberinform_score ? (SCORE_VARIANT[client.iberinform_score] ?? 'grey') : 'grey';

  return (
    <div
      className="bg-white rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-[var(--blue-light)] relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow)' }}
      onClick={() => router.push(`/clientes/${client.id}`)}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      <div className="h-1 card-accent absolute top-0 left-0 right-0" />
      <div className="p-5 pt-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--teal-light)' }}>
            {CLIENT_EMOJIS[client.name] ?? '🏢'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--blue-dark)' }}>{client.name}</div>
            <div className="text-[11px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--grey-3)' }}>
              {client.company_type ?? 'Laboratorio dental'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {client.city && <Badge variant="grey">{client.city}</Badge>}
          {client.iberinform_score && (
            <Badge variant={scoreVariant}>Iberinform: {client.iberinform_score}</Badge>
          )}
        </div>

        <div className="flex gap-4 pt-3 border-t" style={{ borderColor: 'var(--grey-1)' }}>
          <div className="text-center">
            <div className="text-lg font-extrabold" style={{ color: 'var(--blue-dark)' }}>{client._count?.services ?? 0}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-3)' }}>Servicios</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold" style={{ color: 'var(--blue-dark)' }}>{client._count?.tickets ?? 0}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-3)' }}>Tickets</div>
          </div>
          {client.ytd_revenue != null && (
            <div className="text-center ml-auto">
              <div className="text-sm font-extrabold" style={{ color: 'var(--blue)' }}>{formatCurrency(client.ytd_revenue)}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--grey-3)' }}>YTD</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
