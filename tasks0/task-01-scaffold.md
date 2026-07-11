# Task 01 — Scaffold Next.js 14 + git push a GitHub

## Objetivo
Inicializar el proyecto Next.js 14 con App Router, Tailwind, shadcn/ui y next-pwa. Estructura de carpetas, configuración de TypeScript, ESLint. Push inicial a `digrab/m4d`.

## Comandos

```bash
cd /home/raraya/workspace/m4d
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git   # git ya existe (o se init aquí)

# PWA
npm install next-pwa

# Supabase client
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui
npx shadcn@latest init   # tema "default", CSS variables: yes
npx shadcn@latest add button card badge input dialog sheet tabs select textarea

# Iconos
npm install lucide-react

# Utilidades
npm install date-fns clsx tailwind-merge

# Git
git init
git remote add origin git@github.com:digrab/m4d.git
git add .
git commit -m "chore: initial Next.js 14 scaffold"
git branch -M main
git push -u origin main
```

## Estructura de carpetas a crear

```
src/
├── app/
│   ├── layout.tsx          # root layout con nav
│   ├── page.tsx            # redirect → /dashboard
│   ├── dashboard/page.tsx
│   ├── clientes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── proveedores/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── servicios/page.tsx
│   ├── estadisticas/page.tsx
│   └── api/
│       ├── suppliers/route.ts
│       ├── clients/route.ts
│       ├── products/route.ts
│       ├── services/route.ts
│       ├── tickets/route.ts
│       ├── sessions/route.ts
│       ├── consumption/route.ts
│       ├── stats/route.ts
│       ├── enrich/route.ts
│       ├── leads/route.ts
│       └── invoices/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx (mobile)
│   ├── suppliers/
│   ├── clients/
│   ├── products/
│   ├── services/
│   └── ui/               # shadcn components auto-generados
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
└── types/
    └── index.ts            # tipos globales del dominio
```

## Criterio de éxito
- `npm run dev` levanta en localhost:3000 sin errores
- `npm run build` compila limpio
- Push visible en github.com/digrab/m4d
