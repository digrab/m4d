# Task 04 — Core App: layout, tema dental, navegación, PWA

## Objetivo
Shell completa de la app: header con nav, tema dental (paleta azul-marino + teal), layout responsive, configuración PWA (instalable en móvil).

## Archivos a crear/modificar

### next.config.js — PWA
```js
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
module.exports = withPWA({ /* next config */ });
```

### public/manifest.json
```json
{
  "name": "M4D Business", "short_name": "M4D",
  "theme_color": "#0A2540", "background_color": "#F4F6FA",
  "display": "standalone", "start_url": "/dashboard",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }, { "src": "/icon-512.png", "sizes": "512x512" }]
}
```

### src/app/globals.css — Design tokens
Variables CSS: `--blue-dark`, `--blue`, `--teal`, `--grey-*` (extraídas del mockup m4d.html).

### src/app/layout.tsx — Root layout
- `<Header />` sticky con logo M4D, navegación principal, avatar
- Mobile: bottom tab bar con las 5 secciones
- Fuente: `Inter` vía `next/font`

### src/components/layout/Header.tsx
- Logo "M4D" (teal + blanco)
- Nav: Dashboard / Clientes / Proveedores / Servicios / Estadísticas
- Active link styling con teal underline
- Avatar con iniciales del usuario

### src/components/layout/MobileNav.tsx
- Bottom tab bar visible en < 768px
- Iconos Lucide: LayoutDashboard, Users, Building2, Wrench, BarChart3

### Tema Tailwind (tailwind.config.ts)
```ts
colors: {
  'dental-dark': '#0A2540',
  'dental-blue': '#1A5FBF',
  'dental-blue-light': '#E8F0FB',
  'dental-teal': '#00B8A9',
  'dental-teal-light': '#E0F7F5',
}
```

## Criterio de éxito
- App visible en localhost:3000 con header y 5 rutas navegables
- En mobile (DevTools 375px): bottom nav visible, header simplificado
- Lighthouse PWA score ≥ 90
- `npm run build` sin warnings de TypeScript
