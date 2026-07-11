import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  let query = sb.from('services').select('*, clients(id,name), products(id,name,family), suppliers(id,name)').order('opened_at', { ascending: false });
  if (clientId) query = query.eq('client_id', clientId);
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { data, error } = await sb.from('services').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
