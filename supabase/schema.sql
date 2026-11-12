-- WCA Acapulco 2027 — esquema Postgres (Supabase)
-- Ejecutar en SQL Editor del proyecto Supabase (o DBeaver conectado al mismo Postgres).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Identidad
-- ---------------------------------------------------------------------------
create table if not exists public.delegations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'delegation'
    check (role in ('admin', 'staff', 'delegation')),
  delegation_id uuid references public.delegations (id) on delete set null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'delegation',
    false
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers RLS
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.current_delegation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select delegation_id from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('admin', 'staff'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and active = true
  );
$$;

-- Admin: actualizar perfil de otro usuario
create or replace function public.admin_set_profile(
  p_user_id uuid,
  p_role text,
  p_delegation_id uuid,
  p_active boolean,
  p_full_name text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Solo admin';
  end if;
  if p_role is not null and p_role not in ('admin', 'staff', 'delegation') then
    raise exception 'Rol inválido';
  end if;
  update public.profiles
  set
    role = coalesce(p_role, role),
    delegation_id = p_delegation_id,
    active = coalesce(p_active, active),
    full_name = coalesce(p_full_name, full_name)
  where id = p_user_id
  returning * into rec;
  return rec;
end;
$$;

grant execute on function public.admin_set_profile to authenticated;

-- ---------------------------------------------------------------------------
-- Negocio
-- ---------------------------------------------------------------------------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('team', 'athlete', 'official')),
  country text not null,
  name text,
  head text,
  size int,
  event text,
  issf text,
  role text,
  email text,
  delegation_id uuid references public.delegations (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  del_label text not null,
  delegation_id uuid references public.delegations (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.doc_items (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos (id) on delete cascade,
  doc_key text not null,
  status text not null default 'pend'
    check (status in ('pend', 'rev', 'ok', 'rej')),
  file_path text,
  file_name text,
  unique (documento_id, doc_key)
);

create table if not exists public.hotel_bookings (
  id uuid primary key default gen_random_uuid(),
  del_label text not null,
  hotel text not null,
  rooms int not null default 1,
  date_in date not null,
  date_out date not null,
  delegation_id uuid references public.delegations (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.transportes (
  id uuid primary key default gen_random_uuid(),
  del_label text not null,
  type text not null,
  flight text,
  trip_at timestamptz,
  pax int not null default 1,
  status text not null default 'pend'
    check (status in ('pend', 'rev', 'ok')),
  delegation_id uuid references public.delegations (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  t text not null check (t in ('in', 'out')),
  c text not null,
  d text not null,
  a numeric(14, 2) not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.delegations enable row level security;
alter table public.profiles enable row level security;
alter table public.registros enable row level security;
alter table public.documentos enable row level security;
alter table public.doc_items enable row level security;
alter table public.hotel_bookings enable row level security;
alter table public.transportes enable row level security;
alter table public.movimientos enable row level security;

-- Delegations
drop policy if exists delegations_select on public.delegations;
create policy delegations_select on public.delegations
  for select to authenticated
  using (public.is_active_user());

drop policy if exists delegations_admin on public.delegations;
create policy delegations_admin on public.delegations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles
drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff_or_admin());

-- Los usuarios no actualizan role/active desde el cliente.
-- Cambios de rol solo vía admin_set_profile (security definer).
drop policy if exists profiles_update_own_name on public.profiles;
create policy profiles_update_own_name on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and active = (select active from public.profiles where id = auth.uid())
    and delegation_id is not distinct from (select delegation_id from public.profiles where id = auth.uid())
  );

-- Generic helper policies for delegation-scoped tables
-- Registros
drop policy if exists registros_select on public.registros;
create policy registros_select on public.registros
  for select to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists registros_insert on public.registros;
create policy registros_insert on public.registros
  for insert to authenticated
  with check (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists registros_update on public.registros;
create policy registros_update on public.registros
  for update to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists registros_delete on public.registros;
create policy registros_delete on public.registros
  for delete to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

-- Documentos
drop policy if exists documentos_select on public.documentos;
create policy documentos_select on public.documentos
  for select to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists documentos_insert on public.documentos;
create policy documentos_insert on public.documentos
  for insert to authenticated
  with check (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists documentos_update on public.documentos;
create policy documentos_update on public.documentos
  for update to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists documentos_delete on public.documentos;
create policy documentos_delete on public.documentos
  for delete to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists doc_items_all on public.doc_items;
create policy doc_items_all on public.doc_items
  for all to authenticated
  using (
    exists (
      select 1 from public.documentos d
      where d.id = documento_id
        and (
          public.is_staff_or_admin()
          or (public.is_active_user() and d.delegation_id is not distinct from public.current_delegation_id())
        )
    )
  )
  with check (
    exists (
      select 1 from public.documentos d
      where d.id = documento_id
        and (
          public.is_staff_or_admin()
          or (public.is_active_user() and d.delegation_id is not distinct from public.current_delegation_id())
        )
    )
  );

-- Hotel
drop policy if exists hotel_select on public.hotel_bookings;
create policy hotel_select on public.hotel_bookings
  for select to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists hotel_insert on public.hotel_bookings;
create policy hotel_insert on public.hotel_bookings
  for insert to authenticated
  with check (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists hotel_update on public.hotel_bookings;
create policy hotel_update on public.hotel_bookings
  for update to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists hotel_delete on public.hotel_bookings;
create policy hotel_delete on public.hotel_bookings
  for delete to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

-- Transportes
drop policy if exists tr_select on public.transportes;
create policy tr_select on public.transportes
  for select to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists tr_insert on public.transportes;
create policy tr_insert on public.transportes
  for insert to authenticated
  with check (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists tr_update on public.transportes;
create policy tr_update on public.transportes
  for update to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

drop policy if exists tr_delete on public.transportes;
create policy tr_delete on public.transportes
  for delete to authenticated
  using (
    public.is_staff_or_admin()
    or (public.is_active_user() and delegation_id is not distinct from public.current_delegation_id())
  );

-- Finanzas: solo admin/staff
drop policy if exists mov_all on public.movimientos;
create policy mov_all on public.movimientos
  for all to authenticated
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket permisos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('permisos', 'permisos', false)
on conflict (id) do nothing;

drop policy if exists permisos_select on storage.objects;
create policy permisos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'permisos'
    and public.is_active_user()
    and (
      public.is_staff_or_admin()
      or (storage.foldername(name))[1] = public.current_delegation_id()::text
    )
  );

drop policy if exists permisos_insert on storage.objects;
create policy permisos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'permisos'
    and public.is_active_user()
    and (
      public.is_staff_or_admin()
      or (storage.foldername(name))[1] = public.current_delegation_id()::text
    )
  );

drop policy if exists permisos_update on storage.objects;
create policy permisos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'permisos'
    and public.is_active_user()
    and (
      public.is_staff_or_admin()
      or (storage.foldername(name))[1] = public.current_delegation_id()::text
    )
  );

drop policy if exists permisos_delete on storage.objects;
create policy permisos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'permisos'
    and (
      public.is_staff_or_admin()
      or (storage.foldername(name))[1] = public.current_delegation_id()::text
    )
  );
