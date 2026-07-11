import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb.from('clients').select('*').order('name');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { data, error } = await sb.from('clients').insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
