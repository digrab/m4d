# Task 09 — Auto-enriquecimiento (Claude API + Firecrawl)

## Flujo completo

```
Usuario escribe nombre empresa
        ↓
POST /api/enrich { name, country, type: 'client'|'supplier' }
        ↓
1. Google Custom Search API → busca la web oficial
2. Firecrawl → extrae contenido de la URL encontrada
3. Claude API (claude-haiku-4-5) → estructura los datos
        ↓
Devuelve: { name, website, country, city, contact_email, contact_phone,
            company_type, description, nif? }
        ↓
Modal muestra preview para revisar → usuario confirma → POST /api/clients o /api/suppliers
```

---

## `src/app/api/enrich/route.ts`

```ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { name, country = 'Portugal', type } = await req.json();

  // 1. Google Custom Search
  const searchRes = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(name + ' ' + country + ' dental')}&num=3`
  );
  const searchData = await searchRes.json();
  const topUrl = searchData.items?.[0]?.link;

  // 2. Firecrawl (si tenemos URL)
  let pageContent = '';
  if (topUrl) {
    const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: topUrl, formats: ['markdown'], onlyMainContent: true })
    });
    const fcData = await fcRes.json();
    pageContent = fcData.data?.markdown?.slice(0, 3000) || '';
  }

  // 3. Claude estructura los datos
  const prompt = `Extrae información de esta empresa dental a partir del texto de su web.
Nombre buscado: "${name}" (${country})
Tipo: ${type === 'client' ? 'laboratorio/clínica dental' : 'fabricante/proveedor dental'}
URL encontrada: ${topUrl || 'no encontrada'}
Contenido web:
${pageContent}

Devuelve SOLO un JSON con estas claves (null si no disponible):
{ "name", "website", "country", "city", "contact_email", "contact_phone", "company_type", "description" }`;

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }]
  });

  const raw = (msg.content[0] as { text: string }).text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { name };

  return Response.json({ data, source_url: topUrl });
}
```

---

## AddEntityModal — estado con enrichment

```tsx
const [step, setStep] = useState<'search' | 'preview' | 'form'>('search');
const [enriched, setEnriched] = useState<EnrichedData | null>(null);

async function handleSearch() {
  setStep('loading');
  const res = await fetch('/api/enrich', { method: 'POST', body: JSON.stringify({ name, country, type }) });
  const { data } = await res.json();
  setEnriched(data);
  setStep('preview');
}
```

- **Step search**: input nombre + país + botón buscar
- **Step preview**: muestra datos encontrados, cada campo editable, botón "Confirmar y guardar"
- **Step form**: formulario manual completo (fallback si búsqueda vacía)

---

## Dependencias
```bash
npm install @anthropic-ai/sdk
```
`firecrawl` y `google search` se llaman vía `fetch` nativo (no SDK necesario).

---

## Variables necesarias
- `ANTHROPIC_API_KEY`
- `FIRECRAWL_API_KEY` (firecrawl.dev → dashboard → API keys)
- `GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_CX` (console.developers.google.com)
