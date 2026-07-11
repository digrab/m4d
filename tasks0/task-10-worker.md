# Task 10 — Railway Worker: lead discovery cron

## Ubicación en el repo
```
worker/
├── package.json
├── index.js          # entrada principal
├── discover.js       # lógica de búsqueda
└── Dockerfile        # opcional — Railway usa Nixpacks por defecto
```

## package.json
```json
{
  "name": "m4d-worker",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "@supabase/supabase-js": "^2.0.0",
    "node-cron": "^3.0.3"
  }
}
```

## index.js
```js
const cron = require('node-cron');
const { discoverLeads } = require('./discover');

// Lunes a las 08:00 (UTC)
cron.schedule(process.env.CRON_SCHEDULE || '0 8 * * 1', async () => {
  console.log('[worker] Iniciando lead discovery...');
  try {
    const found = await discoverLeads();
    console.log(`[worker] ${found} nuevos leads insertados`);
  } catch (err) {
    console.error('[worker] Error:', err.message);
  }
});

console.log('[worker] Cron iniciado');
```

## discover.js
```js
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SEARCH_QUERIES = [
  'laboratorio dental Portugal',
  'dental lab Lisboa',
  'laboratorio protésico Madrid',
  'centro de fresado dental España',
  'prótesis dental Barcelona',
];

async function discoverLeads() {
  // 1. Obtener nombres de clientes ya registrados para deduplicar
  const { data: existing } = await supabase.from('clients').select('name');
  const existingNames = new Set((existing || []).map(c => c.name.toLowerCase()));

  // También ignorar leads ya conocidos
  const { data: knownLeads } = await supabase.from('leads').select('name');
  (knownLeads || []).forEach(l => existingNames.add(l.name.toLowerCase()));

  let totalInserted = 0;

  for (const query of SEARCH_QUERIES) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&num=10`;
    const res = await fetch(url);
    const data = await res.json();

    for (const item of (data.items || [])) {
      const snippet = `${item.title} ${item.snippet}`;
      if (!looksLikeDentalLab(snippet)) continue;

      // Claude extrae nombre y ciudad del resultado
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 128,
        messages: [{
          role: 'user',
          content: `De este resultado de búsqueda, extrae si es un laboratorio dental/clínica dental real (no un directorio ni un artículo). Si lo es, devuelve JSON: {"name":"...","city":"...","country":"...","website":"..."}. Si no, devuelve null.\n\nTítulo: ${item.title}\nSnippet: ${item.snippet}\nURL: ${item.link}`
        }]
      });

      const text = msg.content[0].text;
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) continue;

      let lead;
      try { lead = JSON.parse(match[0]); } catch { continue; }
      if (!lead?.name) continue;
      if (existingNames.has(lead.name.toLowerCase())) continue;

      await supabase.from('leads').insert({
        name: lead.name,
        company_type: 'Laboratorio dental',
        city: lead.city,
        country: lead.country,
        website: lead.website,
        source: 'google_search',
        status: 'new'
      });

      existingNames.add(lead.name.toLowerCase());
      totalInserted++;
    }

    // Pausa para no saturar la Search API
    await new Promise(r => setTimeout(r, 1000));
  }

  return totalInserted;
}

function looksLikeDentalLab(text) {
  const keywords = ['laboratorio', 'dental', 'lab', 'protésico', 'fresado', 'prótesis'];
  const t = text.toLowerCase();
  return keywords.filter(k => t.includes(k)).length >= 2;
}

module.exports = { discoverLeads };
```

## Deploy en Railway
- Railway detecta `worker/package.json` si se configura el Root Directory = `worker`
- O se usa `railway.json` en raíz especificando `"rootDirectory": "worker"`
- Start command: `node index.js`
- El servicio corre continuamente (no serverless) — plan Hobby es suficiente

## Variables en Railway
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_CX
CRON_SCHEDULE=0 8 * * 1
```
