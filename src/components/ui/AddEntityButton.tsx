'use client';

import { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';

type EntityType = 'client' | 'supplier';

interface EnrichedData {
  name?: string;
  website?: string;
  country?: string;
  city?: string;
  contact_email?: string;
  contact_phone?: string;
  company_type?: string;
  description?: string;
}

export function AddEntityButton({ type }: { type: EntityType }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'search' | 'loading' | 'preview' | 'saving'>('search');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Portugal');
  const [enriched, setEnriched] = useState<EnrichedData | null>(null);
  const [error, setError] = useState('');

  const label = type === 'client' ? 'cliente' : 'proveedor';

  async function handleSearch() {
    if (!name.trim()) return;
    setStep('loading');
    setError('');
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, type }),
      });
      const { data } = await res.json();
      setEnriched({ ...data, name: data.name || name });
      setStep('preview');
    } catch {
      setEnriched({ name });
      setStep('preview');
    }
  }

  async function handleSave() {
    setStep('saving');
    const endpoint = type === 'client' ? '/api/clients' : '/api/suppliers';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });
    setOpen(false);
    setStep('search');
    setName('');
    setEnriched(null);
    window.location.reload();
  }

  function close() {
    setOpen(false);
    setStep('search');
    setName('');
    setEnriched(null);
    setError('');
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-white rounded-xl px-4 py-2.5 transition-colors"
        style={{ background: 'var(--teal)' }}
      >
        <Plus size={16} /> Nuevo {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,37,64,.45)' }} onClick={close}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-base font-bold" style={{ color: 'var(--blue-dark)' }}>
                {step === 'preview' ? `Datos encontrados` : `Nuevo ${label}`}
              </div>
              <button onClick={close} className="text-lg" style={{ color: 'var(--grey-3)' }}>✕</button>
            </div>

            {(step === 'search' || step === 'loading') && (
              <>
                <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: 'var(--teal-light)', color: '#007A6E' }}>
                  🔍 Escribe el nombre y buscaremos información online automáticamente
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--grey-3)' }}>Nombre de la empresa *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={`Ej: Lab Dental Ejemplo`}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ borderColor: 'var(--grey-1)' }}
                    autoFocus
                  />
                </div>
                <div className="mb-5">
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--grey-3)' }}>País</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
                    style={{ borderColor: 'var(--grey-1)' }}
                  >
                    <option>Portugal</option>
                    <option>España</option>
                    <option>Italia</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={close} className="flex-1 border rounded-xl py-2.5 text-sm font-semibold" style={{ borderColor: 'var(--grey-1)', color: 'var(--grey-4)' }}>
                    Cancelar
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={step === 'loading' || !name.trim()}
                    className="flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: 'var(--teal)' }}
                  >
                    {step === 'loading' ? <><Loader2 size={14} className="animate-spin" /> Buscando...</> : <><Search size={14} /> Buscar y dar de alta</>}
                  </button>
                </div>
              </>
            )}

            {(step === 'preview' || step === 'saving') && enriched && (
              <>
                <div className="space-y-2.5 mb-5">
                  {([
                    ['Nombre', 'name'],
                    ['Web', 'website'],
                    ['País', 'country'],
                    ['Ciudad', 'city'],
                    ['Email', 'contact_email'],
                    ['Teléfono', 'contact_phone'],
                    ['Tipo', 'company_type'],
                  ] as [string, keyof EnrichedData][]).map(([label, key]) => (
                    enriched[key] ? (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-xs font-semibold w-16 flex-shrink-0 mt-1" style={{ color: 'var(--grey-3)' }}>{label}</span>
                        <input
                          type="text"
                          value={String(enriched[key] ?? '')}
                          onChange={e => setEnriched(prev => ({ ...prev, [key]: e.target.value }))}
                          className="flex-1 border rounded-lg px-3 py-1.5 text-xs outline-none"
                          style={{ borderColor: 'var(--grey-1)' }}
                        />
                      </div>
                    ) : null
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('search')} className="flex-1 border rounded-xl py-2.5 text-sm font-semibold" style={{ borderColor: 'var(--grey-1)', color: 'var(--grey-4)' }}>
                    ← Volver
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={step === 'saving'}
                    className="flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: 'var(--blue)' }}
                  >
                    {step === 'saving' ? 'Guardando...' : `✓ Confirmar y guardar`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
