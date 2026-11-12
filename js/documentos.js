/* Control documental por delegación. Supabase + Storage o localStorage. */
(function () {
  var COLS = [
    ["imp_arm", "Importación de armas", "Firearms import"],
    ["imp_mun", "Importación de municiones", "Ammunition import"],
    ["sedena", "Permiso SEDENA", "SEDENA permit"],
    ["aduana", "Aduanas (pedimento)", "Customs clearance"],
    ["derechos", "Pago de derechos", "Fee payment"],
    ["exp_arm", "Exportación de armas y municiones", "Firearms & ammo export"]
  ];
  var ST = [["pend", "Pendiente", "Pending"], ["rev", "En revisión", "In review"], ["ok", "Aprobado", "Approved"], ["rej", "Rechazado", "Rejected"]];
  function row(c, s) { var o = { del: c, docs: {} }; COLS.forEach(function (k, i) { o.docs[k[0]] = { st: s[i] || "pend", file: "", path: "", itemId: null }; }); return o; }
  function EX() {
    return [
      row("MEX (Ejemplo)", ["ok", "ok", "rev", "pend", "ok", "pend"]),
      row("ITA (Ejemplo)", ["rev", "rev", "pend", "pend", "ok", "pend"]),
      row("USA (Ejemplo)", ["ok", "rej", "pend", "pend", "rev", "pend"]),
      row("GBR (Ejemplo)", ["pend", "pend", "pend", "pend", "pend", "pend"])
    ];
  }
  var data = [];
  var remote = false;
  function stInfo(k) { return ST.filter(function (s) { return s[0] === k; })[0] || ST[0]; }
  function saveLocal() { store.set("docs", data); }

  function render() {
    document.getElementById("docHead").innerHTML = "<tr><th>" + L("Delegación", "Delegation") + "</th>" + COLS.map(function (c) { return "<th>" + L(c[1], c[2]) + "</th>"; }).join("") + "<th>" + L("Avance", "Progress") + "</th><th></th></tr>";
    var tot = { pend: 0, rev: 0, ok: 0, rej: 0 };
    document.getElementById("docBody").innerHTML = data.map(function (r, i) {
      var ok = 0;
      var cells = COLS.map(function (c) {
        var d = r.docs[c[0]] || { st: "pend", file: "" }; tot[d.st] = (tot[d.st] || 0) + 1; if (d.st === "ok") ok++;
        var s = stInfo(d.st);
        return '<td><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><button type="button" class="st st-' + s[0] + '" data-row="' + i + '" data-col="' + c[0] + '" title="' + L("Clic para cambiar", "Click to change") + '">' + L(s[1], s[2]) + '</button>' +
          '<label style="cursor:pointer" title="' + L("Adjuntar", "Attach") + '">📎<input type="file" hidden data-frow="' + i + '" data-fcol="' + c[0] + '"></label></div>' +
          (d.file ? '<small class="muted" style="display:block;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(d.file) + "</small>" : "") + "</td>";
      }).join("");
      var pct = Math.round(ok / COLS.length * 100);
      var delKey = r.id != null ? r.id : i;
      return "<tr><td><b>" + esc(r.del) + "</b></td>" + cells + '<td style="min-width:110px"><div style="background:#eef0f2;border-radius:6px;height:8px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:var(--verde)"></div></div><small>' + pct + '%</small></td><td><button class="btn btn-outline btn-sm" data-del="' + delKey + '" data-idx="' + i + '" aria-label="Eliminar">✕</button></td></tr>';
    }).join("");
    document.getElementById("docKpis").innerHTML =
      '<div class="kpi"><small>' + L("Delegaciones", "Delegations") + "</small><b>" + data.length + "</b></div>" +
      '<div class="kpi in"><small>' + L("Aprobados", "Approved") + "</small><b>" + (tot.ok || 0) + "</b></div>" +
      '<div class="kpi bal"><small>' + L("En revisión", "In review") + "</small><b>" + (tot.rev || 0) + "</b></div>" +
      '<div class="kpi"><small>' + L("Pendientes", "Pending") + "</small><b>" + (tot.pend || 0) + "</b></div>" +
      '<div class="kpi out"><small>' + L("Rechazados", "Rejected") + "</small><b>" + (tot.rej || 0) + "</b></div>";
  }

  async function load() {
    remote = !!(window.db && window.db.enabled);
    try {
      data = remote ? await window.db.listDocumentos() : (store.get("docs", null) || EX());
    } catch (e) {
      console.error(e); toast(e.message || "Error"); data = [];
    }
    render();
  }

  var body = document.getElementById("docBody");
  body.addEventListener("click", async function (e) {
    var b = e.target.closest(".st[data-row]");
    if (b) {
      var r = data[b.dataset.row];
      var d = r.docs[b.dataset.col];
      var idx = ST.map(function (s) { return s[0]; }).indexOf(d.st);
      d.st = ST[(idx + 1) % ST.length][0];
      try {
        if (remote) {
          await window.db.updateDocItem(d.itemId, r.id, b.dataset.col, { status: d.st });
          await load();
        } else { saveLocal(); render(); }
      } catch (err) { toast(err.message || "Error"); }
      return;
    }
    var x = e.target.closest("[data-del]");
    if (x && confirm(L("¿Eliminar delegación?", "Delete delegation?"))) {
      try {
        if (remote) { await window.db.deleteDocumento(x.dataset.del); await load(); }
        else { data.splice(Number(x.dataset.idx), 1); saveLocal(); render(); }
      } catch (err) { toast(err.message || "Error"); }
    }
  });
  body.addEventListener("change", async function (e) {
    var f = e.target.closest("input[type=file]"); if (!f || !f.files[0]) return;
    var r = data[f.dataset.frow];
    var d = r.docs[f.dataset.fcol];
    var file = f.files[0];
    try {
      if (remote) {
        var delId = r.delegation_id || (window.WCA_AUTH && window.WCA_AUTH.delegationId()) || null;
        var up = await window.db.uploadPermiso(delId, f.dataset.fcol, file);
        var st = d.st === "pend" ? "rev" : d.st;
        await window.db.updateDocItem(d.itemId, r.id, f.dataset.fcol, {
          status: st, file_path: up.path, file_name: up.name
        });
        await load();
        toast(L("Archivo subido a Storage", "File uploaded to Storage"));
      } else {
        d.file = file.name; if (d.st === "pend") d.st = "rev"; saveLocal(); render();
        toast(L("Archivo registrado (demo local)", "File registered (local demo)"));
      }
    } catch (err) {
      console.error(err);
      toast(err.message || "Error");
    }
  });
  document.getElementById("docAdd").addEventListener("click", async function () {
    var inp = document.getElementById("docNew"), v = inp.value.trim(); if (!v) { inp.focus(); return; }
    try {
      if (remote) {
        await window.db.insertDocumento(v, (window.WCA_AUTH && window.WCA_AUTH.delegationId()) || null);
        inp.value = ""; await load();
      } else {
        data.push(row(v, [])); inp.value = ""; saveLocal(); render();
      }
    } catch (err) { toast(err.message || "Error"); }
  });
  document.getElementById("docReset").addEventListener("click", function () {
    if (remote) { toast(L("Seed desde SQL en Supabase.", "Seed from SQL in Supabase.")); return; }
    data = EX(); store.del("docs"); render();
  });
  document.getElementById("docCsv").addEventListener("click", function () {
    downloadCSV("documentos.csv", [["delegacion"].concat(COLS.map(function (c) { return c[1]; }))].concat(
      data.map(function (r) { return [r.del].concat(COLS.map(function (c) { var d = r.docs[c[0]]; return stInfo(d.st)[1] + (d.file ? " (" + d.file + ")" : ""); })); })));
  });
  document.addEventListener("langchange", render);
  document.addEventListener("authready", load);
  if (!window.db || !window.db.enabled) load();
})();
