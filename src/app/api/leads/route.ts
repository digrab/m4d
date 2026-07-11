import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const status = new URL(req.url).searchParams.get('status') ?? 'new';
  const { data, error } = await sb.from('leads').select('*').eq('status', status).order('discovered_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
