# Task 02 — Schema Supabase

## Tablas

```sql
-- ─── SUPPLIERS ────────────────────────────────────────────────
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  country     TEXT,
  website     TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes       TEXT,
  enriched_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── PRODUCT FAMILIES ─────────────────────────────────────────
CREATE TYPE product_family AS ENUM ('machines', 'software', 'consumables');

-- ─── SUPPLIER FAMILIES (máx 3 por proveedor) ──────────────────
CREATE TABLE supplier_families (
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  family      product_family NOT NULL,
  PRIMARY KEY (supplier_id, family)
);

-- ─── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id  UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  family       product_family NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  specs        JSONB,             -- specs técnicas libres
  reference    TEXT,              -- código de referencia del fabricante
  price_ref    NUMERIC(12,2),     -- precio orientativo
  unit         TEXT DEFAULT 'unit',
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── CLIENTS ──────────────────────────────────────────────────
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  company_type    TEXT,            -- lab dental, clínica, centro fresado...
  country         TEXT,
  city            TEXT,
  address         TEXT,
  nif             TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  website         TEXT,
  notes           TEXT,
  iberinform_score TEXT,           -- A / B+ / C etc.
  iberinform_data JSONB,           -- snapshot completo
  iberinform_at   TIMESTAMPTZ,
  enriched_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── CONSUMPTION HISTORY ──────────────────────────────────────
CREATE TABLE consumption_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity        NUMERIC(12,3) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(12,2),
  sale_price      NUMERIC(12,2),
  order_ref       TEXT,
  date            DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── SERVICE TYPE ─────────────────────────────────────────────
CREATE TYPE service_type AS ENUM ('commercial', 'technical', 'training');
CREATE TYPE service_status AS ENUM ('pending', 'in_progress', 'closed');

-- ─── SERVICES ─────────────────────────────────────────────────
CREATE TABLE services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES clients(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  type         service_type NOT NULL,
  status       service_status NOT NULL DEFAULT 'pending',
  title        TEXT NOT NULL,
  description  TEXT,
  opened_at    TIMESTAMPTZ DEFAULT now(),
  closed_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── TICKETS (técnicos) ───────────────────────────────────────
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id      UUID REFERENCES services(id) ON DELETE CASCADE,
  issue           TEXT NOT NULL,
  priority        ticket_priority NOT NULL DEFAULT 'medium',
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ticket_timeline (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID REFERENCES tickets(id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SESSIONS (formación) ─────────────────────────────────────
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    UUID REFERENCES services(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INT DEFAULT 120,
  location      TEXT,
  attendees     INT,
  notes         TEXT,
  completed     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── INVOICES (cache Toconline) ───────────────────────────────
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
  toconline_id    TEXT UNIQUE,      -- ID en Toconline
  number          TEXT,
  status          invoice_status,
  amount          NUMERIC(12,2),
  issued_at       DATE,
  due_at          DATE,
  paid_at         DATE,
  raw             JSONB,            -- payload completo de Toconline
  synced_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── LEADS (potenciales clientes, generados por worker) ───────
CREATE TYPE lead_status AS ENUM ('new', 'reviewed', 'discarded', 'converted');

CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  company_type TEXT,
  city         TEXT,
  country      TEXT,
  website      TEXT,
  source       TEXT,              -- "google_search", "manual"
  status       lead_status DEFAULT 'new',
  notes        TEXT,
  discovered_at TIMESTAMPTZ DEFAULT now()
);

-- ─── REPLENISHMENT ALERTS (vista materializada) ───────────────
-- (calculada vía función/cron, no tabla física — ver task-08-stats)
```

## Índices clave

```sql
CREATE INDEX ON consumption_history (client_id, product_id, date DESC);
CREATE INDEX ON services (client_id, status);
CREATE INDEX ON services (type, status);
CREATE INDEX ON tickets (service_id, priority);
CREATE INDEX ON sessions (scheduled_at);
CREATE INDEX ON leads (status, discovered_at DESC);
```

## RLS (Row Level Security)
Para MVP de un solo usuario, RLS desactivado en todas las tablas (auth manejada por Supabase Auth a nivel de sesión en la app). Activar cuando se escale a multi-usuario.

## Seed data
Ver `task-07-seed.md` — 5 proveedores + productos + 6 clientes cargados vía SQL seed.
