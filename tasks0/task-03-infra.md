# Task 03 — Infraestructura: Supabase + Vercel + Railway + Hetzner

## Ejecutar vía SSH en Hetzner (CLIs autenticadas allí)

```bash
ssh hetzner-agent
```

---

## 3A — Supabase: crear proyecto m4d

```bash
# Listar proyectos existentes para confirmar que m4d no existe
supabase projects list --access-token "$SUPABASE_ACCESS_TOKEN"

# Crear proyecto (región eu-west-1 para latencia Europa)
supabase projects create m4d \
  --org-id <ORG_ID> \
  --region eu-west-1 \
  --db-password <genera con: openssl rand -hex 16> \
  --access-token "$SUPABASE_ACCESS_TOKEN"

# Anotar el ref (12 chars) y la URL del proyecto
supabase projects list --access-token "$SUPABASE_ACCESS_TOKEN"

# Linkear en el repo clonado (tras clone en 3D)
cd /root/m4d
supabase link --project-ref <REF> --access-token "$SUPABASE_ACCESS_TOKEN"

# Aplicar migraciones (schema de task-02)
supabase db push --access-token "$SUPABASE_ACCESS_TOKEN"

# Obtener anon key y service_role key
supabase projects api-keys --project-ref <REF> --access-token "$SUPABASE_ACCESS_TOKEN"
```

**Variables a anotar:**
- `SUPABASE_REF`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<REF>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 3B — Vercel: crear y linkear proyecto m4d

```bash
cd /root/m4d

# Linkear repo a proyecto Vercel (crea el proyecto si no existe)
vercel link --token "$VERCEL_TOKEN" --yes
# cuando pregunte: crear nuevo proyecto → sí, nombre → m4d, scope → digrab

# Configurar variables de entorno en Vercel (producción + preview)
vercel env add NEXT_PUBLIC_SUPABASE_URL production --token "$VERCEL_TOKEN"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token "$VERCEL_TOKEN"
vercel env add SUPABASE_SERVICE_ROLE_KEY production --token "$VERCEL_TOKEN"
vercel env add ANTHROPIC_API_KEY production --token "$VERCEL_TOKEN"
vercel env add FIRECRAWL_API_KEY production --token "$VERCEL_TOKEN"
vercel env add GOOGLE_SEARCH_API_KEY production --token "$VERCEL_TOKEN"
vercel env add GOOGLE_SEARCH_CX production --token "$VERCEL_TOKEN"

# Verificar
vercel env ls --token "$VERCEL_TOKEN"
```

**Nota:** Vercel desplegará automáticamente cuando se haga push a `main` (integración GitHub).  
En el dashboard de Vercel: Settings → Git → conectar `digrab/m4d` → branch `main`.

---

## 3C — Railway: servicio worker m4d-worker

```bash
cd /root/m4d/worker

# Iniciar proyecto Railway (o usar el existente de la cuenta)
railway init   # → crear nuevo proyecto "m4d", servicio "m4d-worker"
railway link   # linkear si ya existe

# Variables de entorno en Railway
railway variables set SUPABASE_URL="https://<REF>.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="<key>"
railway variables set ANTHROPIC_API_KEY="<key>"
railway variables set GOOGLE_SEARCH_API_KEY="<key>"
railway variables set GOOGLE_SEARCH_CX="<cx>"
railway variables set CRON_SCHEDULE="0 8 * * 1"  # lunes 8:00

# Anotar el service name para m4d.json
railway status
```

**Nota:** el worker solo se desplegará cuando el subdirectorio `worker/` tenga un `Dockerfile` o `package.json` con start script. Railway puede usar Nixpacks automáticamente.

---

## 3D — Clonar en Hetzner + crear m4d.json

```bash
# Clonar repo
git clone git@github.com:digrab/m4d /root/m4d

# Crear estructura de tasks
mkdir -p /root/m4d/tasks/{queue,done,failed}
touch /root/m4d/tasks/queue/.gitkeep \
      /root/m4d/tasks/done/.gitkeep \
      /root/m4d/tasks/failed/.gitkeep

# Crear m4d.json en el agente
cat > /root/agent/projects/m4d.json << 'EOF'
{
  "name": "m4d",
  "repoPath": "/root/m4d",
  "githubRepo": "digrab/m4d",
  "railwayService": "m4d-worker",
  "railwayEnvironment": "production",
  "railwayUrl": "",
  "vercelProject": "m4d",
  "supabaseRef": "<REF>"
}
EOF

# Reiniciar agente para que cargue el nuevo proyecto
pm2 restart agent
```

---

## 3E — GitHub webhooks

En github.com/digrab/m4d/settings/hooks → Add webhook:
- **URL**: `http://178.105.210.29/webhook/github`
- **Content type**: `application/json`
- **Secret**: mismo `GITHUB_WEBHOOK_SECRET` del servidor
- **Events**: Push

En Railway dashboard → m4d → Settings → Webhooks:
- **URL**: `http://178.105.210.29/webhook/railway?token=<WEBHOOK_SECRET>`

---

## Criterio de éxito
- `supabase projects list` muestra `m4d`
- `vercel env ls` muestra todas las vars en el proyecto `m4d`
- `railway status` muestra servicio `m4d-worker`
- `ls /root/agent/projects/m4d.json` existe
- `pm2 logs agent` sin errores al cargar m4d.json
