/* Control documental por delegación (demo local). */
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
  function row(c, s) { var o = { del: c, docs: {} }; COLS.forEach(function (k, i) { o.docs[k[0]] = { st: s[i] || "pend", file: "" }; }); return o; }
  function EX() {
    return [
      row("MEX (Ejemplo)", ["ok", "ok", "rev", "pend", "ok", "pend"]),
      row("ITA (Ejemplo)", ["rev", "rev", "pend", "pend", "ok", "pend"]),
      row("USA (Ejemplo)", ["ok", "rej", "pend", "pend", "rev", "pend"]),
      row("GBR (Ejemplo)", ["pend", "pend", "pend", "pend", "pend", "pend"])
    ];
  }
  var data = store.get("docs", null) || EX();
  function save() { store.set("docs", data); }
  function stInfo(k) { return ST.filter(function (s) { return s[0] === k; })[0] || ST[0]; }
  function render() {
    document.getElementById("docHead").innerHTML = "<tr><th>" + L("Delegación", "Delegation") + "</th>" + COLS.map(function (c) { return "<th>" + L(c[1], c[2]) + "</th>"; }).join("") + "<th>" + L("Avance", "Progress") + "</th><th></th></tr>";
    var tot = { pend: 0, rev: 0, ok: 0, rej: 0 };
    document.getElementById("docBody").innerHTML = data.map(function (r, i) {
      var ok = 0;
      var cells = COLS.map(function (c) {
        var d = r.docs[c[0]], s = stInfo(d.st); tot[d.st]++; if (d.st === "ok") ok++;
        return '<td><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><button type="button" class="st st-' + s[0] + '" data-row="' + i + '" data-col="' + c[0] + '" title="' + L("Clic para cambiar", "Click to change") + '">' + L(s[1], s[2]) + '</button>' +
          '<label style="cursor:pointer" title="' + L("Adjuntar (demo)", "Attach (demo)") + '">📎<input type="file" hidden data-frow="' + i + '" data-fcol="' + c[0] + '"></label></div>' +
          (d.file ? '<small class="muted" style="display:block;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(d.file) + "</small>" : "") + "</td>";
      }).join("");
      var pct = Math.round(ok / COLS.length * 100);
      return "<tr><td><b>" + esc(r.del) + "</b></td>" + cells + '<td style="min-width:110px"><div style="background:#eef0f2;border-radius:6px;height:8px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:var(--verde)"></div></div><small>' + pct + '%</small></td><td><button class="btn btn-outline btn-sm" data-del="' + i + '" aria-label="Eliminar">✕</button></td></tr>';
    }).join("");
    document.getElementById("docKpis").innerHTML =
      '<div class="kpi"><small>' + L("Delegaciones", "Delegations") + "</small><b>" + data.length + "</b></div>" +
      '<div class="kpi in"><small>' + L("Aprobados", "Approved") + "</small><b>" + tot.ok + "</b></div>" +
      '<div class="kpi bal"><small>' + L("En revisión", "In review") + "</small><b>" + tot.rev + "</b></div>" +
      '<div class="kpi"><small>' + L("Pendientes", "Pending") + "</small><b>" + tot.pend + "</b></div>" +
      '<div class="kpi out"><small>' + L("Rechazados", "Rejected") + "</small><b>" + tot.rej + "</b></div>";
  }
  var body = document.getElementById("docBody");
  body.addEventListener("click", function (e) {
    var b = e.target.closest(".st[data-row]");
    if (b) {
      var d = data[b.dataset.row].docs[b.dataset.col];
      var idx = ST.map(function (s) { return s[0]; }).indexOf(d.st);
      d.st = ST[(idx + 1) % ST.length][0]; save(); render(); return;
    }
    var x = e.target.closest("[data-del]");
    if (x && confirm(L("¿Eliminar delegación?", "Delete delegation?"))) { data.splice(Number(x.dataset.del), 1); save(); render(); }
  });
  body.addEventListener("change", function (e) {
    var f = e.target.closest("input[type=file]"); if (!f || !f.files[0]) return;
    var d = data[f.dataset.frow].docs[f.dataset.fcol];
    d.file = f.files[0].name; if (d.st === "pend") d.st = "rev"; save(); render();
    toast(L("Archivo registrado (demo, no se sube)", "File registered (demo, not uploaded)"));
  });
  document.getElementById("docAdd").addEventListener("click", function () {
    var inp = document.getElementById("docNew"), v = inp.value.trim(); if (!v) { inp.focus(); return; }
    data.push(row(v, [])); inp.value = ""; save(); render();
  });
  document.getElementById("docReset").addEventListener("click", function () { data = EX(); store.del("docs"); render(); });
  document.getElementById("docCsv").addEventListener("click", function () {
    downloadCSV("documentos-demo.csv", [["delegacion"].concat(COLS.map(function (c) { return c[1]; }))].concat(
      data.map(function (r) { return [r.del].concat(COLS.map(function (c) { var d = r.docs[c[0]]; return stInfo(d.st)[1] + (d.file ? " (" + d.file + ")" : ""); })); })));
  });
  document.addEventListener("langchange", render);
  render();
})();
