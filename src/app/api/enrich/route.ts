import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { name, country = 'Portugal', type = 'client' } = await req.json();

  let topUrl = '';
  let pageContent = '';

  // 1. Google Custom Search
  if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) {
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(name + ' ' + country + ' dental')}&num=3`
      );
      const searchData = await searchRes.json();
      topUrl = searchData.items?.[0]?.link ?? '';
    } catch {}
  }

  // 2. Firecrawl scrape
  if (topUrl && process.env.FIRECRAWL_API_KEY) {
    try {
      const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: topUrl, formats: ['markdown'], onlyMainContent: true }),
      });
      const fcData = await fcRes.json();
      pageContent = (fcData.data?.markdown ?? '').slice(0, 3000);
    } catch {}
  }

  // 3. Claude structures the data
  const prompt = `Extrae información de esta empresa del sector dental.
Nombre buscado: "${name}" (${country})
Tipo: ${type === 'client' ? 'laboratorio/clínica dental (cliente)' : 'fabricante/proveedor dental'}
URL encontrada: ${topUrl || 'no encontrada'}
Contenido web:
${pageContent || '(sin contenido disponible)'}

Devuelve SOLO un JSON con estas claves (null si no disponible):
{ "name": string, "website": string|null, "country": string|null, "city": string|null, "contact_email": string|null, "contact_phone": string|null, "company_type": string|null, "description": string|null }`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (msg.content[0] as { text: string }).text;
    const match = text.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { name };
    return Response.json({ data, source_url: topUrl });
  } catch {
    return Response.json({ data: { name }, source_url: topUrl });
  }
}
