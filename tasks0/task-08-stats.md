# Task 08 — Estadísticas + alertas

## Dashboard `/estadisticas`

### KPI row (arriba)
- Total facturado YTD (de `consumption_history`)
- Clientes activos (con servicio en los últimos 90 días)
- Servicios abiertos
- Sesiones próximas (30 días)

### Gráficos
- Barras horizontales: facturación por cliente (YTD)
- Barras horizontales: facturación por proveedor (YTD)
- Distribución pie/donut: servicios por tipo (comercial/técnico/formación)
- Línea temporal: facturación mensual últimos 12 meses

---

## Alerta 1 — Reposición de consumibles

### Lógica (`/api/stats/replenishment`)

```sql
-- Para cada cliente + producto con al menos 2 registros en consumption_history:
-- 1. Calcular intervalo medio de pedido (en días)
-- 2. Calcular fecha estimada del próximo pedido = última_compra + intervalo_medio
-- 3. Alertar si: fecha_estimada - hoy <= 14 días (umbral configurable)

WITH purchase_intervals AS (
  SELECT
    client_id, product_id,
    date,
    date - LAG(date) OVER (PARTITION BY client_id, product_id ORDER BY date) AS days_since_last
  FROM consumption_history
),
avg_intervals AS (
  SELECT
    client_id, product_id,
    AVG(days_since_last) AS avg_days,
    MAX(date) AS last_purchase
  FROM purchase_intervals WHERE days_since_last IS NOT NULL
  GROUP BY client_id, product_id
  HAVING COUNT(*) >= 1
)
SELECT
  c.name AS client_name,
  p.name AS product_name,
  s.name AS supplier_name,
  ai.last_purchase,
  ai.avg_days::int AS cycle_days,
  (ai.last_purchase + ai.avg_days * INTERVAL '1 day')::date AS next_estimated,
  ((ai.last_purchase + ai.avg_days * INTERVAL '1 day') - CURRENT_DATE)::int AS days_until
FROM avg_intervals ai
JOIN clients c ON c.id = ai.client_id
JOIN products p ON p.id = ai.product_id
JOIN suppliers s ON s.id = p.supplier_id
WHERE ((ai.last_purchase + ai.avg_days * INTERVAL '1 day') - CURRENT_DATE) <= 14
ORDER BY days_until ASC;
```

### UI
- Sección "⚠️ Reposiciones próximas" con tarjetas naranja/rojo
- Cada tarjeta: cliente, producto, proveedor, días restantes, botón "Crear servicio comercial"

---

## Alerta 2 — Potenciales clientes (leads del worker)

### Fuente
Tabla `leads` donde `status = 'new'` (insertados por el worker de Railway).

### UI
- Sección "🔍 Nuevos laboratorios detectados" con tarjetas teal
- Cada tarjeta: nombre, ciudad, tipo, website, botón "Dar de alta como cliente"
- Botón "Descartar" → pone `status = 'discarded'`
- Botón "Dar de alta" → abre `AddEntityModal` pre-rellenado con los datos del lead

### API
```
GET  /api/leads?status=new    → leads nuevos del worker
PUT  /api/leads/[id]          → update status (reviewed/discarded/converted)
```

---

## API stats
```
GET /api/stats/kpis           → totales (facturación YTD, clientes activos, servicios abiertos)
GET /api/stats/by-client      → facturación por cliente
GET /api/stats/by-supplier    → facturación por proveedor
GET /api/stats/by-type        → distribución por tipo de servicio
GET /api/stats/monthly        → facturación mensual últimos 12 meses
GET /api/stats/replenishment  → alertas de reposición
```
