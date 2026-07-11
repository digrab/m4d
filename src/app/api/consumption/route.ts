import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const clientId = new URL(req.url).searchParams.get('client_id');
  let query = sb.from('consumption_history')
    .select('*, products(id,name,family), suppliers(id,name)')
    .order('date', { ascending: false });
  if (clientId) query = query.eq('client_id', clientId);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { data, error } = await sb.from('consumption_history').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
