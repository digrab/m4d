import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb.from('suppliers').select('*, supplier_families(family)').order('name');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { families, ...supplier } = body;
  const { data, error } = await sb.from('suppliers').insert(supplier).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (families?.length) {
    await sb.from('supplier_families').insert(
      families.map((f: string) => ({ supplier_id: data.id, family: f }))
    );
  }
  return Response.json(data, { status: 201 });
}
