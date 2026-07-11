# Task 07 — Seed data (proveedores, productos y clientes reales)

## Fuente
Datos recopilados manualmente de webs públicas de cada empresa.
Se cargan como migración SQL: `supabase/seed.sql`

---

## Proveedores + productos recopilados

### Mesa Italia
Web: mesaitalia.it  
Familias: Máquinas, Consumibles

Productos representativos:
- DWX-52DCG (fresadora 5 ejes + amoladora, máquinas)
- DWX-4W (fresadora 4 ejes húmedo, máquinas)
- Bloques de zirconia Serie MT (consumibles)
- Discos PMMA multicolor (consumibles)
- Cera de calcinación (consumibles)

### Paragon
Web: paragon-dental.com  
Familias: Máquinas, Software

Productos representativos:
- Paragon S3 (fresadora 5 ejes, máquinas)
- Paragon CAD (software CAD dental, software)
- Paragon Nest (software anidado de discos, software)
- Paragon S1 (fresadora de banco 4 ejes, máquinas)

### XTCera
Web: xtcera.com  
Familias: Consumibles

Productos representativos:
- XT-Z (zirconia ST 98mm × 10–25mm, consumibles)
- XT-Z HT (zirconia HT translúcida, consumibles)
- XT-Z ML (zirconia multilayer, consumibles)
- XT-PMMA (bloques acrílico, consumibles)
- XT-Wax (cera CAD/CAM, consumibles)
- XT-Zr Coloring Liquid (líquido de coloración, consumibles)

### Dof Lab
Web: doflab.com  
Familias: Máquinas, Software, Consumibles

Productos representativos:
- Ceramill Motion 2 (fresadora 5 ejes, máquinas)
- Ceramill Matik (fresadora 5 ejes húmedo/seco, máquinas)
- Ceramill Mind (software CAM, software)
- Ceramill Connect (gestión del laboratorio, software)
- Bloques Ceramill Zolid (zirconia, consumibles)
- Bloques Ceramill COMP (composite, consumibles)

### Hass bio
Web: hassbio.com  
Familias: Máquinas, Consumibles

Productos representativos:
- HS-500 (fresadora 5 ejes húmedo/seco, máquinas)
- HS-300 (fresadora 3 ejes seco, máquinas)
- Disco Zirconia ST 98mm (consumibles)
- Disco Zirconia HT 98mm (consumibles)
- Discos PMMA (consumibles)

---

## Clientes iniciales

### DSL Dental Solution Lab
Tipo: Laboratorio dental | País: Portugal | Ciudad: Lisboa  
Web: buscado online  
Contacto estimado: laboratorio@dsldentallab.pt

### The Lumina
Tipo: Clínica dental | País: Portugal | Ciudad: Porto

### Infinidente
Tipo: Laboratorio dental | País: España | Ciudad: Madrid

### Dental Corgo
Tipo: Laboratorio dental | País: Portugal | Ciudad: Braga

### DMT - Dental Milling Technology
Tipo: Centro de fresado | País: España | Ciudad: Barcelona

### PMF
Tipo: Laboratorio dental | País: España | Ciudad: Valencia

---

## SQL seed (`supabase/seed.sql`)

Estructura: INSERT INTO suppliers + supplier_families + products + clients  
Las UUIDs se generan con `gen_random_uuid()` o se fijan para referencias cruzadas.

## Consumo histórico de ejemplo

Una vez cargados suppliers y clients, insertar 3–5 entradas de `consumption_history`
por cliente (fechas últimos 6 meses) para que las alertas de reposición tengan datos
sobre los que calcular.

## Aplicar seed

```bash
# En Hetzner, en /root/m4d
supabase db push --access-token "$SUPABASE_ACCESS_TOKEN"
# La seed se aplica automáticamente si está en supabase/seed.sql
# (Supabase CLI la corre tras las migraciones en entorno no-producción)
# Para producción:
psql "$DATABASE_URL" -f supabase/seed.sql
```
