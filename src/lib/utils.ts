import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null, currency = 'EUR') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
}

export function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatRelative(date?: string | null) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`;
  return formatDate(date);
}

export const FAMILY_LABELS: Record<string, string> = {
  machines: 'Máquinas',
  software: 'Software',
  consumables: 'Consumibles',
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  commercial: 'Comercial',
  technical: 'Técnico',
  training: 'Formación',
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  urgent: 'Urgente',
};
