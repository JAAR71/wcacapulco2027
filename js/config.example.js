/* Copia este archivo a js/config.js y pega URL + anon key del proyecto Supabase.
   Project Settings → API. Nunca pongas la service_role aquí. */
window.WCA_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_ANON_KEY",
  /* Si es false o faltan credenciales, los módulos usan localStorage (demo offline). */
  useSupabase: true
};
