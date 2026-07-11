# Task 06 — Productos, Servicios, Tickets y Sesiones

## Productos

Gestionados desde la ficha del proveedor (tab Catálogo). No tienen página propia.

### ProductForm (dentro de SupplierDetail)
- Nombre, familia (select: máquinas/software/consumibles)
- Referencia, precio orientativo, unidad
- Descripción, specs (campo libre JSON visible como tabla)

---

## Servicios (`/servicios`)

### Vista principal: Kanban
- 3 columnas: Pendiente | En progreso | Cerrado
- Cada card: cliente, producto, tipo (icono color), hace X días
- Filtros por tipo (comercial/técnico/formación) y por cliente
- Drag & drop (opcional MVP: solo botones para cambiar estado)

### ServiceCard en Kanban
- Border-left de color según tipo: azul=comercial, naranja=técnico, teal=formación
- Badge de prioridad (solo técnicos)
- Click → abre ServiceDetailSheet (slide-over lateral)

### ServiceDetailSheet
- Datos del servicio: cliente, producto, tipo, estado, descripción
- Si técnico: sección Tickets (lista + botón crear)
- Si formación: sección Sesiones (agenda + botón crear)
- Timeline de notas

### Crear nuevo servicio
- FAB "+" en todas las páginas → `NewServiceModal`
- Seleccionar tipo → cliente → producto → título
- Si técnico: añadir ticket inicial
- Si formación: añadir primera sesión

---

## Tickets

### TicketCard
- Prioridad (color border: rojo=urgente, naranja=alto, azul=medio, gris=bajo)
- Descripción del problema
- Timeline de notas (historial de actualizaciones)
- Estado: abierto / en progreso / resuelto
- Campo resolución al cerrar

### API routes
```
GET  /api/services           → list (filtros: client_id, type, status)
POST /api/services           → create
PUT  /api/services/[id]      → update (status, description)

GET  /api/tickets            → list (filtro: service_id)
POST /api/tickets            → create
PUT  /api/tickets/[id]       → update (resolution, priority)
POST /api/tickets/[id]/timeline → add note

GET  /api/sessions           → list (filtro: service_id, upcoming)
POST /api/sessions           → create (scheduled_at, duration_min, title)
PUT  /api/sessions/[id]      → update / marcar como completada
```

---

## Historial de consumo

### ConsumedProductRow (en ficha cliente, tab Perfil)
- Producto, proveedor, cantidad, precio, fecha
- Botón "Registrar consumo" → form: producto (select), cantidad, precio, fecha, referencia pedido

### API
```
GET  /api/consumption?client_id=X   → historial ordenado por fecha
POST /api/consumption               → registrar nuevo consumo
```
