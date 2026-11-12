/* Hoja de ingresos/egresos (demo). Todos los montos son EJEMPLO. Moneda: MXN. */
(function () {
  var CATS = [["inscripciones", "Inscripciones", "Entry fees"], ["patrocinio", "Patrocinios", "Sponsorship"], ["apoyos", "Apoyos gubernamentales", "Government support"], ["servicios", "Servicios a delegaciones", "Delegation services"],
    ["platos", "Platos y municiones", "Targets & ammunition"], ["personal", "Personal y jueces", "Staff & judges"], ["transporte", "Transporte", "Transport"], ["hospedaje", "Hospedaje oficiales", "Officials' accommodation"], ["sede", "Sede y equipamiento", "Venue & equipment"], ["ceremonias", "Ceremonias y premiación", "Ceremonies & awards"], ["otros", "Otros", "Other"]];
  function EX() {
    return [
      { t: "in", c: "inscripciones", d: "Cuotas de inscripción (Ejemplo)", a: 12345.67 },
      { t: "in", c: "patrocinio", d: "Patrocinador A (Ejemplo)", a: 50000 },
      { t: "in", c: "servicios", d: "Renta de gazebos (Ejemplo)", a: 8500.5 },
      { t: "out", c: "platos", d: "Platos de tiro (Ejemplo)", a: 23456.78 },
      { t: "out", c: "personal", d: "Jueces y árbitros (Ejemplo)", a: 15000 },
      { t: "out", c: "transporte", d: "Shuttle aeropuerto–campo (Ejemplo)", a: 9876.54 },
      { t: "out", c: "ceremonias", d: "Medallas y premiación (Ejemplo)", a: 4321.09 }
    ];
  }
  var data = store.get("fin", null) || EX();
  var filter = "all";
  function save() { store.set("fin", data); }
  function parse(s) { var n = parseFloat(String(s).replace(/,/g, "")); return isFinite(n) ? Math.round(n * 100) / 100 : 0; }
  function catName(k) { var c = CATS.filter(function (x) { return x[0] === k; })[0] || CATS[CATS.length - 1]; return L(c[1], c[2]); }
  function totals() {
    var tin = 0, tout = 0;
    data.forEach(function (r) { if (r.t === "in") tin += r.a; else tout += r.a; });
    return { tin: tin, tout: tout, bal: tin - tout };
  }
  function renderTotals() {
    var s = totals();
    document.getElementById("fIn").textContent = fmtMoney(s.tin);
    document.getElementById("fOut").textContent = fmtMoney(s.tout);
    var b = document.getElementById("fBal"); b.textContent = (s.bal < 0 ? "-" : "") + fmtMoney(Math.abs(s.bal)); b.className = "num " + (s.bal < 0 ? "neg" : "pos");
    document.getElementById("finKpis").innerHTML =
      '<div class="kpi in"><small>' + L("Ingresos", "Income") + " (MXN)</small><b class=\"pos\">" + fmtMoney(s.tin) + "</b></div>" +
      '<div class="kpi out"><small>' + L("Egresos", "Expenses") + " (MXN)</small><b class=\"neg\">" + fmtMoney(s.tout) + "</b></div>" +
      '<div class="kpi bal"><small>Balance (MXN)</small><b class="' + (s.bal < 0 ? "neg" : "pos") + '">' + (s.bal < 0 ? "-" : "") + fmtMoney(Math.abs(s.bal)) + "</b></div>" +
      '<div class="kpi"><small>' + L("Movimientos", "Entries") + "</small><b>" + data.length + "</b></div>";
    var by = {};
    data.forEach(function (r) { by[r.c] = by[r.c] || { i: 0, o: 0 }; if (r.t === "in") by[r.c].i += r.a; else by[r.c].o += r.a; });
    document.getElementById("finCat").innerHTML = CATS.filter(function (c) { return by[c[0]]; }).map(function (c) {
      var x = by[c[0]], b = x.i - x.o;
      return "<tr><td>" + L(c[1], c[2]) + '</td><td class="num">' + fmtMoney(x.i) + '</td><td class="num">' + fmtMoney(x.o) + '</td><td class="num ' + (b < 0 ? "neg" : "pos") + '">' + (b < 0 ? "-" : "") + fmtMoney(Math.abs(b)) + "</td></tr>";
    }).join("");
  }
  function render() {
    document.getElementById("finBody").innerHTML = data.map(function (r, i) {
      if (filter !== "all" && r.t !== filter) return "";
      return '<tr><td><select data-i="' + i + '" data-k="t"><option value="in"' + (r.t === "in" ? " selected" : "") + ">" + L("Ingreso", "Income") + '</option><option value="out"' + (r.t === "out" ? " selected" : "") + ">" + L("Egreso", "Expense") + "</option></select></td>" +
        '<td><select data-i="' + i + '" data-k="c">' + CATS.map(function (c) { return '<option value="' + c[0] + '"' + (r.c === c[0] ? " selected" : "") + ">" + L(c[1], c[2]) + "</option>"; }).join("") + "</select></td>" +
        '<td><input data-i="' + i + '" data-k="d" value="' + esc(r.d) + '" style="min-width:200px"></td>' +
        '<td class="num"><input class="num" inputmode="decimal" data-i="' + i + '" data-k="a" value="' + fmtMoney(r.a) + '" style="min-width:130px"></td>' +
        '<td><button class="btn btn-outline btn-sm" data-del="' + i + '" aria-label="Eliminar">✕</button></td></tr>';
    }).join("");
    renderTotals();
  }
  var body = document.getElementById("finBody");
  body.addEventListener("input", function (e) {
    var el = e.target, i = el.dataset.i, k = el.dataset.k; if (i == null) return;
    if (k === "a") data[i].a = parse(el.value); else data[i][k] = el.value;
    save(); renderTotals();
  });
  body.addEventListener("change", function (e) {
    var el = e.target; if (el.dataset.k === "a") el.value = fmtMoney(data[el.dataset.i].a);
    if (el.dataset.k === "t") render();
  });
  body.addEventListener("focusin", function (e) { if (e.target.dataset.k === "a") e.target.value = data[e.target.dataset.i].a; });
  body.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b) { data.splice(Number(b.dataset.del), 1); save(); render(); } });
  function add(t) { data.push({ t: t, c: t === "in" ? "patrocinio" : "otros", d: L("Nuevo concepto (Ejemplo)", "New item (Example)"), a: 0 }); save(); render(); }
  document.getElementById("finAddIn").addEventListener("click", function () { add("in"); });
  document.getElementById("finAddOut").addEventListener("click", function () { add("out"); });
  document.getElementById("finFilter").addEventListener("change", function (e) { filter = e.target.value; render(); });
  document.getElementById("finReset").addEventListener("click", function () { data = EX(); store.del("fin"); render(); });
  document.getElementById("finCsv").addEventListener("click", function () {
    var s = totals();
    downloadCSV("finanzas-demo.csv", [["tipo", "categoria", "concepto", "monto_mxn"]].concat(data.map(function (r) { return [r.t === "in" ? "Ingreso" : "Egreso", catName(r.c), r.d, r.a.toFixed(2)]; }))
      .concat([[], ["", "", "Total ingresos", s.tin.toFixed(2)], ["", "", "Total egresos", s.tout.toFixed(2)], ["", "", "Balance", s.bal.toFixed(2)]]));
  });
  document.addEventListener("langchange", render);
  render();
})();
