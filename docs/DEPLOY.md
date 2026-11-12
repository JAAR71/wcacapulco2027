# Deploy (Cloudflare Pages + rubinmex.com)

## Cómo llega el sitio al live

1. El sitio estático vive en el proyecto Pages **`wcacapulco2027`** (`https://wcacapulco2027.pages.dev`).
2. El Worker [`worker/`](../worker/) hace proxy de `https://www.rubinmex.com/wcacapulco2027/*` → ese Pages.
3. Pages se publica por **Direct Upload** (`wrangler pages deploy`), no por “Connect to Git”. Un `git push` solo actualiza el live si corre el GitHub Action (o un deploy manual).

## Auto-deploy (GitHub Actions)

Workflow: [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) — se dispara en cada **push a `main`**.

### Secretos (una sola vez)

En GitHub → repo **Settings → Secrets and variables → Actions**:

| Secret | Valor |
|--------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | `cca212ef746f050d6f099db8cad1ed54` |
| `CLOUDFLARE_API_TOKEN` | Token de Cloudflare con permiso **Account → Cloudflare Pages → Edit** |

Crear el token: [Cloudflare → My Profile → API Tokens → Create Token](https://dash.cloudflare.com/profile/api-tokens) (plantilla “Edit Cloudflare Workers” o custom con Pages Edit).

Sin `CLOUDFLARE_API_TOKEN` el Action falla; el login OAuth local de wrangler no aplica en CI.

## Deploy manual (respaldo)

Desde la raíz del repo, con wrangler autenticado (`npx wrangler login`):

```bash
npx wrangler pages deploy . --project-name=wcacapulco2027 --branch=main --commit-dirty=true
```

Listar deployments:

```bash
npx wrangler pages deployment list --project-name=wcacapulco2027
```

## URLs

- Producción vía proxy: https://www.rubinmex.com/wcacapulco2027/
- Origen Pages: https://wcacapulco2027.pages.dev/
