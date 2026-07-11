# Task 05 — Módulo Proveedores + Clientes

## Proveedores (`/proveedores`)

### Página listado
- Grid responsive de `SupplierCard` (logo emoji + nombre + familias de producto + stats)
- Botón "+ Nuevo proveedor" → abre `AddEntityModal`
- Búsqueda local en tiempo real

### SupplierCard
- Acento superior con gradiente azul→teal
- Nombre, tipo, familias (badges azul/teal/gris)
- Stats: nº productos, nº servicios activos
- Click → navega a `/proveedores/[id]`

### Página detalle `/proveedores/[id]`
- Header: nombre, país, website
- Tabs: **Perfil** | **Catálogo** | **Servicios**
- Perfil: info general + familias asignadas
- Catálogo: tabla de productos con badge de familia + precio
- Servicios: lista de servicios activos relacionados

---

## Clientes (`/clientes`)

### Página listado
- Igual que proveedores pero con `ClientCard`
- ClientCard extra: score Iberinform (badge color), ciudad, YTD revenue

### Página detalle `/clientes/[id]`
- Tabs: **Perfil** | **Servicios** | **Tickets** | **Sesiones** | **Facturas** | **Iberinform**
- Perfil: info empresa + productos contratados (lista de consumo reciente)
- Servicios: lista filtrada por cliente
- Tickets: tickets técnicos con prioridad y estado
- Sesiones: agenda de formación (próximas + históricas)
- Facturas: tabla con datos Toconline (o placeholder "conectar API")
- Iberinform: widget de score + datos financieros (o placeholder)

---

## API routes

```
GET  /api/suppliers          → list all
POST /api/suppliers          → create
GET  /api/suppliers/[id]     → get one + products + services
PUT  /api/suppliers/[id]     → update
DELETE /api/suppliers/[id]   → delete

GET  /api/clients            → list all
POST /api/clients            → create
GET  /api/clients/[id]       → get one + services + tickets + sessions + invoices
PUT  /api/clients/[id]       → update
DELETE /api/clients/[id]     → delete
```

---

## AddEntityModal (compartido)
- Input "Nombre de empresa"
- Select "País"
- Botón "🔍 Buscar y dar de alta" → llama `/api/enrich`
- Preview de datos encontrados antes de guardar
- Fallback: formulario manual completo si la búsqueda falla

---

## Tipos TypeScript (`src/types/index.ts`)
```ts
export type ProductFamily = 'machines' | 'software' | 'consumables';
export interface Supplier { id: string; name: string; country?: string; ... }
export interface Client { id: string; name: string; iberinform_score?: string; ... }
export interface Product { id: string; supplier_id: string; family: ProductFamily; name: string; ... }
```
