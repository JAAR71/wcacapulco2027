# Setup Supabase + DBeaver + deploy (wca.rubinmex.com)

## 1. Crear proyecto Supabase

1. En [supabase.com](https://supabase.com) crea un proyecto (región cercana).
2. **Project Settings → API**: copia `Project URL` y `anon` `public` key.
3. Copia [`js/config.example.js`](../js/config.example.js) → `js/config.js` y pega URL + anon key; pon `useSupabase: true`.
4. **Authentication → Providers → Email**: habilita Email. Desactiva “Confirm email” solo en desarrollo si quieres ir más rápido; en producción déjalo activo.
5. En **Authentication → URL Configuration** agrega:
   - Site URL: `https://wca.rubinmex.com` (y `http://localhost:8000` para local)
   - Redirect URLs: las mismas + `https://wcacapulco2027.com` cuando exista

## 2. Esquema SQL

En **SQL Editor** (o DBeaver):

1. Ejecuta [`supabase/schema.sql`](../supabase/schema.sql)
2. Ejecuta [`supabase/seed.sql`](../supabase/seed.sql)

## 3. Primer administrador

1. Crea un usuario: Authentication → Users → Add user, **o** “Solicitar acceso” en `login.html`.
2. Actívalo como admin:

```sql
update public.profiles
set role = 'admin', active = true, full_name = 'Admin LOC'
where email = 'tu-correo@ejemplo.com';
```

3. Entra en `login.html` y abre `admin.html` para activar al resto (staff / delegation).

## 4. DBeaver

New Connection → PostgreSQL:

| Campo | Valor |
|-------|--------|
| Host | `db.<project-ref>.supabase.co` (o host del pooler Session) |
| Port | `5432` (directo) o `6543` (pooler) |
| Database | `postgres` |
| User | `postgres` (o el del panel) |
| Password | Database password del proyecto |
| SSL | Mode = `require` |

Datos en: **Project Settings → Database**. No uses la `service_role` API key aquí.

## 5. Roles

| Rol | Acceso |
|-----|--------|
| `admin` | Todo + Admin usuarios/delegaciones |
| `staff` | Registros, Documentos, Logística, Finanzas |
| `delegation` | Solo su `delegation_id` (sin Finanzas) |

Con `useSupabase: false` el sitio sigue en demo `localStorage` (sin login).

## 6. Deploy desarrollo: `wca.rubinmex.com`

1. Sube el sitio a **Cloudflare Pages** (directorio raíz del repo; sin build, o build vacío).
2. En DNS de `rubinmex.com`: CNAME `wca` → tu proyecto Pages.
3. Asegura que `js/config.js` en el deploy tenga URL/anon correctos (no subas `service_role`).
4. Mantén `noindex` y el banner de borrador.

## 7. Cutover a `wcacapulco2027.com`

1. Compra el dominio y apunta al **mismo** proyecto Pages.
2. Actualiza Site URL / Redirect URLs en Supabase Auth.
3. Opcional: proyecto Supabase “prod” + dump; o reutiliza el mismo.
4. Quita banner/`noindex` cuando el Delegado Técnico apruebe.
