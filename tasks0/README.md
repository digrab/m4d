# M4D — Plan de ejecución
**Ejecutado por:** Claude Code local (no agente Hetzner)  
**Fecha inicio:** 2026-07-11

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + API routes | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| UI | Tailwind CSS + shadcn/ui |
| PWA | next-pwa |
| Deployment frontend | Vercel → `digrab/m4d` |
| Worker background | Railway (servicio `m4d-worker`) |
| Enriquecimiento auto | Claude API (claude-haiku-4-5) + Firecrawl |
| Lead discovery cron | Railway worker, ejecución semanal |
| Repo | `git@github.com:digrab/m4d.git` |

---

## Arquitectura de servicios

```
Vercel (Next.js app)          Railway (worker)
  ├─ /app                       ├─ Cron semanal
  ├─ /api/suppliers             │   Lead discovery (búsqueda labs
  ├─ /api/clients               │   dentales no en cartera)
  ├─ /api/products              └─ → escribe en Supabase leads table
  ├─ /api/services
  ├─ /api/tickets                     ↕ (todos leen/escriben)
  ├─ /api/sessions
  ├─ /api/stats              Supabase (PostgreSQL)
  ├─ /api/enrich              ├─ suppliers, products
  ├─ /api/toconline           ├─ clients, consumption_history
  └─ /api/iberinform          ├─ services, tickets, sessions
                              ├─ invoices (cache Toconline)
                              ├─ financial_scores (cache Iberinform)
                              └─ leads (potenciales clientes)
```

---

## Orden de ejecución

| # | Tarea | Archivo | Puede ejecutar sin bloqueos |
|---|-------|---------|----------------------------|
| 01 | Scaffold Next.js + git push | `task-01-scaffold.md` | ✅ |
| 02 | Diseño schema Supabase | `task-02-schema.md` | ✅ |
| 03 | Infra: Supabase project + Vercel + Railway + Hetzner | `task-03-infra.md` | ✅ (vía SSH Hetzner) |
| 04 | Core app: layout, tema dental, nav, PWA | `task-04-app-core.md` | ✅ |
| 05 | Módulo Proveedores + Clientes (UI + CRUD) | `task-05-suppliers-clients.md` | tras 04 |
| 06 | Módulo Productos, Servicios, Tickets, Sesiones | `task-06-products-services.md` | tras 05 |
| 07 | Seed data (proveedores y clientes reales) | `task-07-seed.md` | tras 03 (necesita Supabase) |
| 08 | Dashboard de estadísticas + alertas | `task-08-stats.md` | tras 06 |
| 09 | Auto-enriquecimiento (Claude API + Firecrawl) | `task-09-enrichment.md` | tras 05 |
| 10 | Railway worker (lead discovery cron) | `task-10-worker.md` | tras 03 |
| 11 | Integraciones Toconline + Iberinform | `task-11-integrations.md` | tras API keys |

---

## Variables de entorno necesarias

### Vercel (Next.js app)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=          # Claude API para enriquecimiento
FIRECRAWL_API_KEY=          # Scraping de webs de empresas
GOOGLE_SEARCH_API_KEY=      # Búsqueda de nuevas empresas
GOOGLE_SEARCH_CX=           # Custom Search Engine ID
TOCONLINE_API_KEY=          # Pendiente: facilitar usuario
IBERINFORM_API_KEY=         # Pendiente: verificar acceso API
```

### Railway (worker)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CX=
```

---

## Registro en Hetzner agent

Archivo a crear en servidor: `/root/agent/projects/m4d.json`
```json
{
  "name": "m4d",
  "repoPath": "/root/m4d",
  "githubRepo": "digrab/m4d",
  "railwayService": "m4d-worker",
  "railwayEnvironment": "production",
  "railwayUrl": "",
  "vercelProject": "m4d",
  "supabaseRef": "<ref pendiente creación>"
}
```

Registro webhook GitHub: `http://178.105.210.29/webhook/github`  
Registro webhook Railway: `http://178.105.210.29/webhook/railway?token=<WEBHOOK_SECRET>`
