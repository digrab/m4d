-- M4D — actualización con datos reales de proveedores y catálogo
-- Aplicar: supabase db push (o psql -f este archivo)

-- ─── SUPPLIERS: metadatos verificados ─────────────────────────────────────────

UPDATE suppliers SET
  country       = 'Italia',
  website       = 'https://www.mesaitalia.it',
  contact_email = 'info@mesaitalia.it',
  contact_phone = '+39 030 686 3251',
  notes         = 'MESA ITALIA S.R.L. Fundada en 1975, Brescia. Aleaciones dentales de precisión (CoCr, titanio, preciosas), discos para fresado CAD/CAM y sistema de implantes IGEA. Fabricación 100% italiana, distribución en más de 75 países.'
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE suppliers SET
  country       = 'España',
  website       = 'https://www.paragon.tools',
  contact_email = 'info@paragon.tools',
  contact_phone = '+34 679 430 321',
  notes         = 'Paragon Tools SL. Fabricante español de fresas y herramientas de corte para fresadoras dentales CAD/CAM. Optimizadas para zirconia, CoCr, titanio, PMMA y PEEK. Sede en Badalona (Barcelona). NIF: B67362848.'
WHERE id = '11111111-0000-0000-0000-000000000002';

UPDATE suppliers SET
  contact_email = 'xtcera@xianton.com',
  contact_phone = '+86 181 2551 8955',
  notes         = 'Shenzhen Xiangtong Co., Ltd. Fabricante chino fundado en 2001. Materiales CAD/CAM dentales (zirconia multicapa, PMMA, vitrocerámica) y fresadoras serie X-mill. Más de 25 años y 20.000 máquinas instaladas en todo el mundo.'
WHERE id = '11111111-0000-0000-0000-000000000003';

UPDATE suppliers SET
  country       = 'Corea del Sur',
  contact_email = 'info@doflab.com',
  contact_phone = '+82-70-5057-3518',
  notes         = 'DOF Inc. Fabricante coreano de soluciones CAD/CAM integrales. Escáneres 3D (Freedom HD, Freedom S) y fresadoras 5 ejes (Sharp2-5X). Software ScanApp y MotionApp. Sede en Seúl, exporta a 101 países. Delegación comercial europea en Alemania.'
WHERE id = '11111111-0000-0000-0000-000000000004';

UPDATE suppliers SET
  country       = 'Corea del Sur',
  contact_email = 'hasscorp@hassbio.com',
  contact_phone = '+82-70-7712-1300',
  notes         = 'HASS Corporation. Fabricante coreano fundado en 2008 en Gangneung. Bloques CAD/CAM cerámicos: disilicato de litio (Amber Mill), zirconia (Amber Zir) y PMMA. Presente en más de 50 países. Delegaciones en EE.UU., Alemania y China.'
WHERE id = '11111111-0000-0000-0000-000000000005';

-- ─── SUPPLIER FAMILIES: corrección ────────────────────────────────────────────
-- Mesa Italia: solo consumables (aleaciones y discos metálicos)
-- Paragon Tools: solo consumables (fresas/burs)
-- XTCera: machines + consumables (fresadoras X-mill + discos)
-- Dof Lab: machines + software + consumables (compatibles)
-- Hass bio: solo consumables (cerámicas y PMMA)

DELETE FROM supplier_families;
INSERT INTO supplier_families (supplier_id, family) VALUES
  ('11111111-0000-0000-0000-000000000001', 'consumables'),
  ('11111111-0000-0000-0000-000000000002', 'consumables'),
  ('11111111-0000-0000-0000-000000000003', 'machines'),
  ('11111111-0000-0000-0000-000000000003', 'consumables'),
  ('11111111-0000-0000-0000-000000000004', 'machines'),
  ('11111111-0000-0000-0000-000000000004', 'software'),
  ('11111111-0000-0000-0000-000000000004', 'consumables'),
  ('11111111-0000-0000-0000-000000000005', 'consumables');

-- ─── PRODUCTS: actualización in-place (preserva FKs de consumption_history) ───

-- ── Mesa Italia (aleaciones y discos metálicos CAD/CAM) ───────────────────────
UPDATE products SET
  family      = 'consumables',
  name        = 'Disco CoCr 98mm - Mesa Italia',
  description = 'Disco de cobalto-cromo para fresado en húmedo. Alta dureza y resistencia a la corrosión.',
  reference   = 'MI-COCR-98',
  price_ref   = 280.00,
  unit        = 'unit'
WHERE id = '22222222-0000-0000-0000-000000000001';

UPDATE products SET
  family      = 'consumables',
  name        = 'Disco Titanio Grado 2 98mm - Mesa Italia',
  description = 'Disco de titanio grado 2 biocompatible para fresado en húmedo.',
  reference   = 'MI-TI-G2',
  price_ref   = 320.00,
  unit        = 'unit'
WHERE id = '22222222-0000-0000-0000-000000000002';

UPDATE products SET
  family      = 'consumables',
  name        = 'Aleación CoCr No Preciosa - Rexillium III',
  description = 'Aleación de cobalto-cromo para colado. Alta resistencia mecánica y biocompatibilidad.',
  reference   = 'MI-REX3',
  price_ref   = 88.00,
  unit        = 'kg'
WHERE id = '22222222-0000-0000-0000-000000000003';

UPDATE products SET
  family      = 'consumables',
  name        = 'Aleación CoCr Cerapress Plus',
  description = 'Aleación no preciosa de alta fusión para prótesis ceramo-metálica.',
  reference   = 'MI-CEP',
  price_ref   = 95.00,
  unit        = 'kg'
WHERE id = '22222222-0000-0000-0000-000000000004';

-- ── Paragon Tools (fresas y kits) ─────────────────────────────────────────────
UPDATE products SET
  family      = 'consumables',
  name        = 'Kit Fresas Zirconia Premium (10 uds)',
  description = 'Kit de 10 fresas de alto rendimiento para zirconia. Colocación automática compatible.',
  reference   = 'PAR-KIT-ZR10',
  price_ref   = 285.00,
  unit        = 'kit'
WHERE id = '22222222-0000-0000-0000-000000000005';

UPDATE products SET
  family      = 'consumables',
  name        = 'Fresa Zirconia 1.0mm - Paragon',
  description = 'Fresa monobloque para zirconia. Alta precisión y durabilidad.',
  reference   = 'PAR-ZR-10',
  price_ref   = 22.00,
  unit        = 'unit'
WHERE id = '22222222-0000-0000-0000-000000000006';

UPDATE products SET
  family      = 'consumables',
  name        = 'Pack Fresas PMMA (5 uds) - Paragon',
  description = 'Pack de 5 fresas step para PMMA y resinas compuestas.',
  reference   = 'PAR-PMMA-5',
  price_ref   = 75.00,
  unit        = 'kit'
WHERE id = '22222222-0000-0000-0000-000000000007';

UPDATE products SET
  family      = 'consumables',
  name        = 'Fresa CoCr 1.0mm - Paragon',
  description = 'Fresa de carburo de tungsteno para cobalto-cromo y titanio.',
  reference   = 'PAR-COCR-10',
  price_ref   = 28.00,
  unit        = 'unit'
WHERE id = '22222222-0000-0000-0000-000000000008';

-- ── XTCera (discos — ya correctos, solo actualizar descriptions) ──────────────
UPDATE products SET description = 'Disco de zirconia standard translucency 98mm. Para coronas y puentes posteriores.'
WHERE id = '22222222-0000-0000-0000-000000000009';

UPDATE products SET description = 'Disco de zirconia high translucency 98mm. Para restauraciones anteriores y posteriores estéticas.'
WHERE id = '22222222-0000-0000-0000-000000000010';

UPDATE products SET description = 'Disco de zirconia multilayer con gradiente de translucencia. Efecto cromático natural.'
WHERE id = '22222222-0000-0000-0000-000000000011';

UPDATE products SET description = 'Discos de acrílico PMMA 98mm para provisionales y prótesis completas.'
WHERE id = '22222222-0000-0000-0000-000000000012';

UPDATE products SET description = 'Cera de calcinación CAD/CAM 98mm para colado indirecto y prótesis metálica.'
WHERE id = '22222222-0000-0000-0000-000000000013';

UPDATE products SET description = 'Juego de 8 líquidos colorantes para personalización cromática de discos de zirconia XT-Z.'
WHERE id = '22222222-0000-0000-0000-000000000014';

-- ── Dof Lab / DOF Inc. (escáner, fresadora, software) ────────────────────────
UPDATE products SET
  name        = 'DOF Freedom HD (Escáner 3D Dental)',
  description = 'Escáner 3D de laboratorio de alta definición. Resolución < 5μm. Compatible con todos los sistemas CAD/CAM del mercado.',
  reference   = 'DOF-FHD',
  price_ref   = 8900.00
WHERE id = '22222222-0000-0000-0000-000000000015';

UPDATE products SET
  name        = 'DOF Sharp2-5X (Fresadora 5 ejes)',
  description = 'Fresadora dental de 5 ejes para fresado húmedo y seco. Compatible con zirconia, CoCr, PMMA, titanio y cera CAD.',
  reference   = 'DOF-S25X',
  price_ref   = 24900.00
WHERE id = '22222222-0000-0000-0000-000000000016';

UPDATE products SET
  name        = 'DOF ScanApp (Software de escaneado)',
  description = 'Software para control del escáner Freedom HD. Flujos de trabajo guiados e interfaz intuitiva.',
  reference   = 'DOF-SCA',
  price_ref   = 1200.00
WHERE id = '22222222-0000-0000-0000-000000000017';

UPDATE products SET
  name        = 'DOF MotionApp (Software de fresado)',
  description = 'Software CAM para control de la fresadora Sharp2-5X. Estrategias de mecanizado optimizadas por material.',
  reference   = 'DOF-MTA',
  price_ref   = 980.00
WHERE id = '22222222-0000-0000-0000-000000000018';

UPDATE products SET
  name        = 'Disco Zirconia Multilayer 98mm (compatible DOF)',
  description = 'Disco de zirconia multicapa validado para fresadoras DOF Sharp2-5X.',
  reference   = 'DOF-ZML-98'
WHERE id = '22222222-0000-0000-0000-000000000019';

UPDATE products SET
  name        = 'Composite CAD/CAM 98mm (compatible DOF)',
  description = 'Bloque de composite de alta resistencia para restauraciones CAD/CAM en fresadoras DOF.',
  reference   = 'DOF-COMP'
WHERE id = '22222222-0000-0000-0000-000000000020';

-- ── Hass bio / HASS Corporation (cerámicas y materiales) ─────────────────────
UPDATE products SET
  family      = 'consumables',
  name        = 'Amber Mill A1-D4 (Disilicato de Litio CAD)',
  description = 'Bloques de disilicato de litio en estado cristalizado para fresado en seco. Caja de 5 bloques.',
  reference   = 'HB-AMB-A',
  price_ref   = 195.00,
  unit        = 'box'
WHERE id = '22222222-0000-0000-0000-000000000021';

UPDATE products SET
  family      = 'consumables',
  name        = 'Amber Mill BL Monolítico (Disilicato de Litio)',
  description = 'Bloques de alta translucencia BL para restauraciones monolíticas anteriores. Caja de 5.',
  reference   = 'HB-AMB-BL',
  price_ref   = 210.00,
  unit        = 'box'
WHERE id = '22222222-0000-0000-0000-000000000022';

UPDATE products SET
  description = 'Disco de zirconia standard translucency 98mm - HASS Corporation. Para coronas posteriores.'
WHERE id = '22222222-0000-0000-0000-000000000023';

UPDATE products SET
  description = 'Disco de zirconia high translucency 98mm - HASS Corporation. Para restauraciones anteriores.'
WHERE id = '22222222-0000-0000-0000-000000000024';

UPDATE products SET
  description = 'Discos de PMMA monocolor y multicolor 98mm - HASS Corporation. Para provisionales estéticos.'
WHERE id = '22222222-0000-0000-0000-000000000025';

-- ── Nueva máquina XTCera (no referenciada en consumption_history) ─────────────
INSERT INTO products (supplier_id, family, name, description, reference, price_ref, unit) VALUES
  ('11111111-0000-0000-0000-000000000003', 'machines',
   'X-mill 700 (Fresadora 5 ejes XTCera)',
   'Fresadora dental de 5 ejes húmedo/seco. Materiales: zirconia, CoCr, PMMA, titanio y cera CAD. Pantalla táctil 10".',
   'XTM-700', 18500.00, 'unit');
