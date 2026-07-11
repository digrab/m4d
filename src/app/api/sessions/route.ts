import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get('service_id');
  const upcoming = searchParams.get('upcoming');

  let query = sb.from('sessions').select('*, services(client_id, clients(name))').order('scheduled_at');
  if (serviceId) query = query.eq('service_id', serviceId);
  if (upcoming) query = query.gte('scheduled_at', new Date().toISOString());

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { data, error } = await sb.from('sessions').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
