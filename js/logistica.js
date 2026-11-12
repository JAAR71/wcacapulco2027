/* Logística (demo local): hoteles, transporte y otros servicios. Hoteles y tarifas son EJEMPLO. */
(function () {
  var HOTELS = [
    { id: "A", name: "Hotel Ejemplo A", zone: ["Zona Dorada (ejemplo)", "Golden Zone (example)"], rate: 1500, note: ["Hotel oficial sugerido — por confirmar", "Suggested official hotel — TBC"] },
    { id: "B", name: "Hotel Ejemplo B", zone: ["Zona Diamante (ejemplo)", "Diamond Zone (example)"], rate: 2000, note: ["Cerca del aeropuerto — por confirmar", "Near the airport — TBC"] },
    { id: "C", name: "Hotel Ejemplo C", zone: ["Acapulco Tradicional (ejemplo)", "Traditional Acapulco (example)"], rate: 1000, note: ["Opción económica — por confirmar", "Budget option — TBC"] }
  ];
  var TT = { arr: ["Llegada aeropuerto → hotel", "Airport arrival → hotel"], dep: ["Hotel → aeropuerto", "Hotel → airport"], range: ["Hotel ↔ campo de tiro", "Hotel ↔ range"], arms: ["Armas: aduana → armería", "Firearms: customs → armory"] };
  var EXH = [{ del: "MEX (Ejemplo)", hotel: "A", rooms: 6, in: "2027-03-10", out: "2027-03-20" }, { del: "ITA (Ejemplo)", hotel: "B", rooms: 4, in: "2027-03-11", out: "2027-03-19" }];
  var EXT = [{ del: "ITA (Ejemplo)", type: "arr", flight: "XX 000", date: "2027-03-11T14:30", pax: 8, st: "rev" }, { del: "MEX (Ejemplo)", type: "range", flight: "", date: "2027-03-12T07:00", pax: 12, st: "ok" }];
  var hb = store.get("hotel", null) || EXH.slice(), tr = store.get("tr", null) || EXT.slice();
  function hotel(id) { return HOTELS.filter(function (h) { return h.id === id; })[0] || HOTELS[0]; }
  function nights(a, b) { var n = Math.round((new Date(b) - new Date(a)) / 864e5); return n > 0 ? n : 0; }
  function l2(a) { return L(a[0], a[1]); }
  var ST = { pend: ["Pendiente", "Pending"], rev: ["En revisión", "In review"], ok: ["Confirmado", "Confirmed"] };
  function render() {
    document.getElementById("hotelCards").innerHTML = HOTELS.map(function (h) {
      return '<div class="card"><span class="ejemplo">' + L("Ejemplo", "Example") + "</span><h3 style=\"margin:.4em 0\">🏨 " + h.name + '</h3><p class="muted" style="margin:0 0 6px">' + l2(h.zone) + "</p><p style=\"margin:0\">" + L("Tarifa por noche", "Rate per night") + ": <b>MXN " + fmtMoney(h.rate) + '</b></p><p class="muted" style="font-size:.85rem;margin:.4em 0 0">' + l2(h.note) + "</p></div>";
    }).join("");
    var sel = document.getElementById("hHotel"), cur = sel.value;
    sel.innerHTML = HOTELS.map(function (h) { return '<option value="' + h.id + '">' + h.name + "</option>"; }).join(""); if (cur) sel.value = cur;
    var total = 0;
    document.getElementById("hotelBody").innerHTML = hb.map(function (r, i) {
      var h = hotel(r.hotel), n = nights(r.in, r.out), t = n * r.rooms * h.rate; total += t;
      return "<tr><td>" + esc(r.del) + "</td><td>" + h.name + '</td><td class="num">' + r.rooms + "</td><td>" + esc(r.in) + "</td><td>" + esc(r.out) + '</td><td class="num">' + n + '</td><td class="num">' + fmtMoney(t) + '</td><td><button class="btn btn-outline btn-sm" data-hdel="' + i + '">✕</button></td></tr>';
    }).join("");
    document.getElementById("hotelTotal").textContent = "MXN " + fmtMoney(total);
    document.getElementById("trBody").innerHTML = tr.map(function (r, i) {
      var s = r.st || "pend", cls = { pend: "st-pend", rev: "st-rev", ok: "st-ok" }[s];
      return "<tr><td>" + esc(r.del) + "</td><td>" + l2(TT[r.type]) + "</td><td>" + esc(r.flight || "—") + "</td><td>" + esc(String(r.date).replace("T", " ")) + '</td><td class="num">' + r.pax + '</td><td><button type="button" class="st ' + cls + '" data-tst="' + i + '">' + l2(ST[s]) + '</button></td><td><button class="btn btn-outline btn-sm" data-tdel="' + i + '">✕</button></td></tr>';
    }).join("");
    var other = [["🛂", "Cartas de invitación / visas", "Invitation letters / visas", "Solicitud por delegación; formato por definir.", "Request per delegation; format TBD."],
      ["⛺", "Gazebos en el campo", "Range gazebos", "Renta y asignación por delegación — tarifas por confirmar.", "Rental and allocation per delegation — rates TBC."],
      ["🍽️", "Alimentos en el campo", "Meals at the range", "Paquetes de comida — por confirmar.", "Meal packages — TBC."],
      ["🎫", "Acreditación", "Accreditation", "Gafetes para atletas, oficiales y prensa.", "Badges for athletes, officials and press."],
      ["🏥", "Servicio médico", "Medical service", "Atención en el campo y hospital de referencia — por confirmar.", "On-site care and referral hospital — TBC."],
      ["📦", "Almacén de armas", "Firearms storage", "Armería custodiada en el campo — por confirmar.", "Guarded armory at the range — TBC."]];
    document.getElementById("otrosCards").innerHTML = other.map(function (o) { return '<div class="card"><h3>' + o[0] + " " + L(o[1], o[2]) + '</h3><p class="muted" style="margin:0">' + L(o[3], o[4]) + "</p></div>"; }).join("");
  }
  document.getElementById("logTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    document.querySelectorAll("#logTabs button").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
  });
  document.getElementById("hotelForm").addEventListener("submit", function (e) {
    e.preventDefault(); var v = function (id) { return document.getElementById(id).value; };
    if (nights(v("hIn"), v("hOut")) < 1) { toast(L("La salida debe ser posterior a la llegada", "Check-out must be after check-in")); return; }
    hb.push({ del: v("hDel").trim(), hotel: v("hHotel"), rooms: Number(v("hRooms")) || 1, in: v("hIn"), out: v("hOut") });
    store.set("hotel", hb); e.target.reset(); render(); toast(L("Reservación agregada (demo)", "Booking added (demo)"));
  });
  document.getElementById("trForm").addEventListener("submit", function (e) {
    e.preventDefault(); var v = function (id) { return document.getElementById(id).value; };
    tr.push({ del: v("tDel").trim(), type: v("tType"), flight: v("tFlight").trim(), date: v("tDate"), pax: Number(v("tPax")) || 1, st: "pend" });
    store.set("tr", tr); e.target.reset(); render(); toast(L("Traslado solicitado (demo)", "Transfer requested (demo)"));
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-hdel]"), b = e.target.closest("[data-tdel]"), c = e.target.closest("[data-tst]");
    if (a) { hb.splice(Number(a.dataset.hdel), 1); store.set("hotel", hb); render(); }
    if (b) { tr.splice(Number(b.dataset.tdel), 1); store.set("tr", tr); render(); }
    if (c) { var r = tr[c.dataset.tst], o = ["pend", "rev", "ok"]; r.st = o[(o.indexOf(r.st || "pend") + 1) % 3]; store.set("tr", tr); render(); }
  });
  document.getElementById("logReset").addEventListener("click", function () { hb = EXH.slice(); tr = EXT.slice(); store.del("hotel"); store.del("tr"); render(); });
  document.addEventListener("langchange", render);
  render();
})();
