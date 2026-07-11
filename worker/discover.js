const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const QUERIES = [
  'laboratorio dental Portugal',
  'dental lab Lisboa Porto',
  'laboratorio protésico Madrid Barcelona',
  'centro de fresado dental España',
  'laboratorio prótesis dental Valencia',
];

async function discoverLeads() {
  const { data: existingClients } = await supabase.from('clients').select('name');
  const { data: existingLeads } = await supabase.from('leads').select('name');

  const known = new Set([
    ...(existingClients || []).map(c => c.name.toLowerCase()),
    ...(existingLeads || []).map(l => l.name.toLowerCase()),
  ]);

  let inserted = 0;

  for (const query of QUERIES) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&num=10`;
      const res = await fetch(url);
      const data = await res.json();

      for (const item of (data.items || [])) {
        if (!looksLikeDentalLab(`${item.title} ${item.snippet}`)) continue;

        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 128,
          messages: [{
            role: 'user',
            content: `¿Es este resultado un laboratorio dental o clínica dental real (no un directorio, artículo ni portal)?
Título: ${item.title}
Snippet: ${item.snippet}
URL: ${item.link}

Si es un laboratorio/clínica dental real: devuelve SOLO JSON {"name":"...","city":"...","country":"...","website":"..."}
Si no: devuelve null`,
          }],
        });

        const text = msg.content[0].text.trim();
        if (text === 'null' || !text.includes('{')) continue;

        let lead;
        try { lead = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || 'null'); } catch { continue; }
        if (!lead?.name) continue;
        if (known.has(lead.name.toLowerCase())) continue;

        await supabase.from('leads').insert({
          name: lead.name,
          company_type: 'Laboratorio dental',
          city: lead.city || null,
          country: lead.country || null,
          website: lead.website || null,
          source: 'google_search',
          status: 'new',
        });

        known.add(lead.name.toLowerCase());
        inserted++;
      }
    } catch (err) {
      console.error(`Query "${query}" failed:`, err.message);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  return inserted;
}

function looksLikeDentalLab(text) {
  const t = text.toLowerCase();
  const hits = ['laboratorio', 'dental', 'lab', 'protésico', 'fresado', 'prótesis', 'clínica'].filter(k => t.includes(k));
  return hits.length >= 2;
}

module.exports = { discoverLeads };
