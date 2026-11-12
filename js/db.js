/* Cliente Supabase + API de datos. Si useSupabase=false, los módulos siguen con localStorage. */
(function () {
  var cfg = window.WCA_CONFIG || {};
  var urlOk = !!(cfg.supabaseUrl
    && cfg.supabaseUrl.indexOf("YOUR_PROJECT") < 0
    && /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/i.test(String(cfg.supabaseUrl).trim()));
  var ready = !!(cfg.useSupabase && urlOk && cfg.supabaseAnonKey && window.supabase);

  var client = null;
  if (ready) {
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  window.db = {
    enabled: ready,
    client: client,
    DOC_KEYS: ["imp_arm", "imp_mun", "sedena", "aduana", "derechos", "exp_arm"],

    async getSession() {
      if (!ready) return null;
      var r = await client.auth.getSession();
      return r.data.session || null;
    },

    async getProfile() {
      if (!ready) return null;
      var session = await this.getSession();
      if (!session) return null;
      var r = await client.from("profiles").select("*, delegations(code,name)").eq("id", session.user.id).maybeSingle();
      if (r.error) throw r.error;
      return r.data;
    },

    async signIn(email, password) {
      if (!ready) throw new Error("Supabase no configurado");
      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) throw r.error;
      return r.data;
    },

    async signUp(email, password, fullName) {
      if (!ready) throw new Error("Supabase no configurado");
      var r = await client.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: fullName || "" } }
      });
      if (r.error) throw r.error;
      return r.data;
    },

    async signOut() {
      if (!ready) return;
      await client.auth.signOut();
    },

    async listRegistros() {
      var r = await client.from("registros").select("*").order("created_at", { ascending: false });
      if (r.error) throw r.error;
      return r.data || [];
    },

    async insertRegistro(row) {
      var r = await client.from("registros").insert(row).select().single();
      if (r.error) throw r.error;
      return r.data;
    },

    async deleteRegistro(id) {
      var r = await client.from("registros").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async listDocumentos() {
      var r = await client.from("documentos").select("*, doc_items(*)").order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return (r.data || []).map(function (d) {
        var docs = {};
        (d.doc_items || []).forEach(function (it) {
          docs[it.doc_key] = { st: it.status, file: it.file_name || "", path: it.file_path || "", itemId: it.id };
        });
        window.db.DOC_KEYS.forEach(function (k) {
          if (!docs[k]) docs[k] = { st: "pend", file: "", path: "", itemId: null };
        });
        return { id: d.id, del: d.del_label, delegation_id: d.delegation_id, docs: docs };
      });
    },

    async insertDocumento(delLabel, delegationId) {
      var ins = await client.from("documentos").insert({
        del_label: delLabel,
        delegation_id: delegationId || null
      }).select().single();
      if (ins.error) throw ins.error;
      var items = window.db.DOC_KEYS.map(function (k) {
        return { documento_id: ins.data.id, doc_key: k, status: "pend" };
      });
      var it = await client.from("doc_items").insert(items);
      if (it.error) throw it.error;
      return ins.data;
    },

    async updateDocItem(itemId, documentoId, docKey, patch) {
      if (itemId) {
        var r = await client.from("doc_items").update(patch).eq("id", itemId);
        if (r.error) throw r.error;
        return;
      }
      var upsert = Object.assign({ documento_id: documentoId, doc_key: docKey }, patch);
      var r2 = await client.from("doc_items").upsert(upsert, { onConflict: "documento_id,doc_key" });
      if (r2.error) throw r2.error;
    },

    async deleteDocumento(id) {
      var r = await client.from("documentos").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async uploadPermiso(delegationId, docKey, file) {
      var folder = delegationId || "staff";
      var path = folder + "/" + docKey + "/" + Date.now() + "-" + file.name.replace(/[^\w.\-]+/g, "_");
      var up = await client.storage.from("permisos").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      return { path: path, name: file.name };
    },

    async listHotel() {
      var r = await client.from("hotel_bookings").select("*").order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return (r.data || []).map(function (h) {
        return { id: h.id, del: h.del_label, hotel: h.hotel, rooms: h.rooms, in: h.date_in, out: h.date_out, delegation_id: h.delegation_id };
      });
    },

    async insertHotel(row) {
      var r = await client.from("hotel_bookings").insert({
        del_label: row.del,
        hotel: row.hotel,
        rooms: row.rooms,
        date_in: row.in,
        date_out: row.out,
        delegation_id: row.delegation_id || null
      }).select().single();
      if (r.error) throw r.error;
      return r.data;
    },

    async deleteHotel(id) {
      var r = await client.from("hotel_bookings").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async listTransportes() {
      var r = await client.from("transportes").select("*").order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return (r.data || []).map(function (t) {
        return {
          id: t.id, del: t.del_label, type: t.type, flight: t.flight || "",
          date: t.trip_at ? String(t.trip_at).slice(0, 16) : "", pax: t.pax, st: t.status,
          delegation_id: t.delegation_id
        };
      });
    },

    async insertTransporte(row) {
      var r = await client.from("transportes").insert({
        del_label: row.del,
        type: row.type,
        flight: row.flight || null,
        trip_at: row.date || null,
        pax: row.pax,
        status: row.st || "pend",
        delegation_id: row.delegation_id || null
      }).select().single();
      if (r.error) throw r.error;
      return r.data;
    },

    async updateTransporte(id, patch) {
      var r = await client.from("transportes").update(patch).eq("id", id);
      if (r.error) throw r.error;
    },

    async deleteTransporte(id) {
      var r = await client.from("transportes").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async listMovimientos() {
      var r = await client.from("movimientos").select("*").order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return (r.data || []).map(function (m) {
        return { id: m.id, t: m.t, c: m.c, d: m.d, a: Number(m.a) };
      });
    },

    async insertMovimiento(row) {
      var r = await client.from("movimientos").insert(row).select().single();
      if (r.error) throw r.error;
      return r.data;
    },

    async updateMovimiento(id, patch) {
      var r = await client.from("movimientos").update(patch).eq("id", id);
      if (r.error) throw r.error;
    },

    async deleteMovimiento(id) {
      var r = await client.from("movimientos").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async listProfiles() {
      var r = await client.from("profiles").select("*, delegations(code,name)").order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return r.data || [];
    },

    async listDelegations() {
      var r = await client.from("delegations").select("*").order("code");
      if (r.error) throw r.error;
      return r.data || [];
    },

    async upsertDelegation(row) {
      var r = await client.from("delegations").upsert(row, { onConflict: "code" }).select().single();
      if (r.error) throw r.error;
      return r.data;
    },

    async adminSetProfile(userId, role, delegationId, active, fullName) {
      var r = await client.rpc("admin_set_profile", {
        p_user_id: userId,
        p_role: role,
        p_delegation_id: delegationId,
        p_active: active,
        p_full_name: fullName || null
      });
      if (r.error) throw r.error;
      return r.data;
    }
  };
})();
