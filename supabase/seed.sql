-- Datos de ejemplo + instrucción primer admin
-- 1) Crea un usuario en Authentication → Users (o Sign up en login.html)
-- 2) Actívalo como admin (reemplaza el email):

-- update public.profiles
-- set role = 'admin', active = true, full_name = 'Admin LOC'
-- where email = 'tu-correo@ejemplo.com';

insert into public.delegations (code, name) values
  ('MEX', 'México — FEMETI (Ejemplo)'),
  ('ITA', 'Italia (Ejemplo)'),
  ('USA', 'Estados Unidos (Ejemplo)'),
  ('GBR', 'Gran Bretaña (Ejemplo)')
on conflict (code) do nothing;

-- Seed finanzas de ejemplo (solo visible para staff/admin una vez logueados)
insert into public.movimientos (t, c, d, a)
select * from (values
  ('in'::text, 'inscripciones', 'Cuotas de inscripción (Ejemplo)', 12345.67::numeric),
  ('in', 'patrocinio', 'Patrocinador A (Ejemplo)', 50000),
  ('in', 'servicios', 'Renta de gazebos (Ejemplo)', 8500.5),
  ('out', 'platos', 'Platos de tiro (Ejemplo)', 23456.78),
  ('out', 'personal', 'Jueces y árbitros (Ejemplo)', 15000),
  ('out', 'transporte', 'Shuttle aeropuerto–campo (Ejemplo)', 9876.54),
  ('out', 'ceremonias', 'Medallas y premiación (Ejemplo)', 4321.09)
) as v(t, c, d, a)
where not exists (select 1 from public.movimientos limit 1);
