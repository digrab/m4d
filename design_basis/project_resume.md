# M4D — Business Management Platform
**Versión:** 0.1 (Design Basis)
**Fecha:** 2026-06-16

---

## Descripción

M4D es una plataforma web instalable en móvil (PWA) para la gestión integral de un negocio de distribución en el sector de prótesis dentales. Cubre la relación con proveedores, clientes, catálogo de productos y los tres servicios que se proveen sobre ellos: comercial, técnico y formación.

---

## Contexto de negocio

El operador actúa como distribuidor entre fabricantes del sector dental y laboratorios / clínicas dentales. Para cada producto que distribuye, presta tres tipos de servicio:

| Tipo | Descripción |
|------|-------------|
| **Comercial** | Venta y seguimiento post-venta |
| **Técnico** | Mantenimiento rutinario e incidencias con tickets |
| **Formación** | Sesiones formativas agendadas sobre uso y ventajas del producto |

---

## Proveedores iniciales

| Proveedor | Familias de producto |
|-----------|----------------------|
| Mesa Italia | Máquinas, Consumibles |
| Paragon | Máquinas, Software |
| XTCera | Consumibles |
| Dof Lab | Máquinas, Software, Consumibles |
| Hass bio | Máquinas, Consumibles |

Familias de producto: **Máquinas · Software · Consumibles**

---

## Clientes iniciales

DSL Dental Solution Lab · The Lumina · Infinidente · Dental Corgo · DMT - Dental Milling Technology · PMF

---

## Integraciones externas

| Plataforma | Propósito | Estado |
|------------|-----------|--------|
| **Toconline** | Gestión de facturas y declaración fiscal | API pendiente de credenciales |
| **Iberinform** | Información financiera de clientes | API pendiente de credenciales |
| **Search API** (Google/Serp) | Enriquecimiento automático al dar de alta proveedores o clientes por nombre | Por configurar |

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend + API | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel (app) + Supabase (DB) |
| PWA | next-pwa |
| UI | Tailwind CSS + shadcn/ui |
| Repo | https://github.com/digrab/m4d.git |

---

## Modelo de datos (borrador)

```
Supplier
  └─ product_families[]        (máquinas / software / consumibles)
  └─ Products[]
       └─ name, description, specs, price_ref

Client
  └─ name, company_type, contact, location
  └─ iberinform_snapshot (salud financiera)
  └─ Invoices[]               (vía Toconline)

Service
  └─ type: commercial | technical | training
  └─ status: open | in_progress | closed
  └─ client_id → Client
  └─ product_id → Product
  └─ timeline[]               (hitos / notas)
  └─ Ticket (si técnico)
       └─ issue_description, priority, resolution
  └─ Session (si formación)
       └─ date, duration, attendees, notes
```

---

## Estructura de UI

```
HEADER NAV
├── Dashboard      → KPIs y actividad reciente
├── Clientes       → Grid de tarjetas → Detalle cliente
│     └─ Perfil | Servicios | Tickets | Sesiones | Facturas | Iberinform
├── Proveedores    → Grid de tarjetas → Detalle proveedor
│     └─ Perfil | Catálogo de productos | Servicios activos
├── Servicios      → Vista Kanban/lista por estado
└── Estadísticas   → Revenue · Actividad · Tipos de servicio · Clientes top
```

---

## Fases de desarrollo

| Fase | Alcance |
|------|---------|
| **1** | Core CRUD: proveedores, clientes, productos, servicios + PWA shell + UI dental |
| **2** | Tickets técnicos + agenda de formación |
| **3** | Búsqueda online para alta automática de entidades |
| **4** | Dashboard de estadísticas |
| **5** | Integración Toconline (facturas) |
| **6** | Integración Iberinform (salud financiera) |

---

## Decisiones de diseño pendientes de validar

- Paleta de colores y estilo visual (ver mockup `m4d.html`)
- Flujo de alta de servicio (desde cliente o desde producto)
- Vista Kanban vs lista para servicios
- Nivel de detalle en tarjetas de la vista grid
