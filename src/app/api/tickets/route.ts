import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const serviceId = new URL(req.url).searchParams.get('service_id');
  let query = sb.from('tickets').select('*, ticket_timeline(*)').order('created_at', { ascending: false });
  if (serviceId) query = query.eq('service_id', serviceId);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { data, error } = await sb.from('tickets').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
