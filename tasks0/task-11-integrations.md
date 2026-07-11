# Task 11 — Integraciones Toconline e Iberinform

## Estado inicial
Ambas integraciones arrancan como **placeholders** en la UI con un banner 
"Conectar API". Se activan cuando el usuario proporciona las API keys.

---

## Toconline

### Qué integramos
- **Consultar facturas** de un cliente → mostrar en tab "Facturas"
- **Emitir factura** desde la app → botón "+ Factura" en tab Facturas
- **Sync periódico** → cache en tabla `invoices` de Supabase (cada hora vía API route con revalidación)

### Documentación
Toconline expone una API REST en `https://www.toconline.pt/api/v1/`.  
Autenticación: `Bearer <API_KEY>` en header Authorization.

Endpoints relevantes:
```
GET  /invoices?customer_id=X        → listar facturas de cliente
POST /invoices                       → crear factura
GET  /invoices/{id}                  → detalle
```

### `src/app/api/invoices/route.ts`
```ts
const BASE = 'https://www.toconline.pt/api/v1';
const KEY  = process.env.TOCONLINE_API_KEY;

export async function GET(req: Request) {
  if (!KEY) return Response.json({ placeholder: true });
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');
  const res = await fetch(`${BASE}/invoices?customer_id=${clientId}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  const data = await res.json();
  // Cachear en Supabase para offline
  // ...
  return Response.json(data);
}
```

### UI (placeholder state)
```tsx
{!toconlineKey ? (
  <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
    🔗 Conecta tu cuenta Toconline en Configuración para ver facturas aquí
  </div>
) : (
  <InvoiceList invoices={invoices} />
)}
```

---

## Iberinform

### Qué integramos
- **Score financiero** de un cliente → mostrar en tab Iberinform como widget
- **Datos clave**: capital, empleados, deuda, límite crédito recomendado
- Se llama on-demand al abrir el tab (no en background)

### Verificación de acceso
Iberinform tiene API para suscripciones profesionales.  
**Pendiente**: el usuario debe verificar en su dashboard si tiene sección "API" o "Tokens".

Si tiene acceso, los endpoints típicos son:
```
GET /companies/search?name=X&country=PT   → buscar empresa
GET /companies/{id}/report                → informe financiero completo
GET /companies/{id}/score                 → solo score (más ligero)
```

### `src/app/api/iberinform/route.ts`
```ts
const BASE = 'https://api.iberinform.es/v1';   // URL tentativa — verificar docs
const KEY  = process.env.IBERINFORM_API_KEY;

export async function GET(req: Request) {
  if (!KEY) return Response.json({ placeholder: true });
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const country = searchParams.get('country') || 'PT';
  
  // 1. Buscar empresa
  const search = await fetch(`${BASE}/companies/search?name=${encodeURIComponent(name)}&country=${country}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  const { companies } = await search.json();
  if (!companies?.length) return Response.json({ not_found: true });

  // 2. Obtener score del primer resultado
  const report = await fetch(`${BASE}/companies/${companies[0].id}/score`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  const data = await report.json();
  
  // Cachear en columna iberinform_data del cliente
  // await supabase.from('clients').update({ iberinform_data: data, iberinform_at: new Date() }).eq('name', name)
  
  return Response.json(data);
}
```

### UI (placeholder state)
```tsx
{!iberinformKey ? (
  <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
    🔗 Conecta tu cuenta Iberinform en Configuración para ver análisis financiero
  </div>
) : (
  <IberinformWidget clientName={client.name} country={client.country} />
)}
```

---

## Configuración de API keys en la app

`/configuracion` (página futura) o directamente vía variables de entorno Vercel:

```bash
# Añadir cuando el usuario tenga las keys
vercel env add TOCONLINE_API_KEY production --token "$VERCEL_TOKEN"
vercel env add IBERINFORM_API_KEY production --token "$VERCEL_TOKEN"
# Redirigir el deployment para que las coja
vercel redeploy --token "$VERCEL_TOKEN"
```
