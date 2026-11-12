/* Registro logístico local. Con Supabase activo usa Postgres; si no, localStorage. */
(function () {
  var EX = [
    { type: "team", country: "MEX — FEMETI (Ejemplo)", head: "Nombre Ejemplo", size: 12, email: "correo@ejemplo.com" },
    { type: "athlete", country: "MEX (Ejemplo)", name: "Atleta Ejemplo 1", event: "TR-M", issf: "000000", email: "correo@ejemplo.com" },
    { type: "athlete", country: "ITA (Ejemplo)", name: "Atleta Ejemplo 2", event: "SK-W", issf: "000000", email: "correo@ejemplo.com" },
    { type: "official", country: "USA (Ejemplo)", name: "Oficial Ejemplo", role: "coach", email: "correo@ejemplo.com" }
  ];
  var EV = { "TR-M": ["Trap hombres", "Trap men"], "TR-W": ["Trap mujeres", "Trap women"], "SK-M": ["Skeet hombres", "Skeet men"], "SK-W": ["Skeet mujeres", "Skeet women"], "TR-MX": ["Trap equipo mixto", "Trap mixed team"], "SK-MX": ["Skeet equipo mixto", "Skeet mixed team"] };
  var RO = { coach: ["Entrenador", "Coach"], head: ["Jefe de equipo", "Team leader"], medic: ["Médico / fisioterapeuta", "Doctor / physio"], judge: ["Juez", "Judge"], other: ["Otro", "Other"] };
  var TY = { team: ["Equipo", "Team"], athlete: ["Atleta", "Athlete"], official: ["Oficial", "Official"] };
  var data = [];
  var type = "team";
  var remote = false;

  function l2(a) { return L(a[0], a[1]); }
  function detail(r) {
    if (r.type === "team") return esc(r.head || "—") + " · " + (r.size || 0) + " " + L("integrantes", "members");
    if (r.type === "athlete") return esc(r.name) + " · " + l2(EV[r.event] || ["", ""]) + " · ISSF ID " + esc(r.issf || "—");
    return esc(r.name) + " · " + l2(RO[r.role] || ["", ""]);
  }
  function render() {
    document.getElementById("regBody").innerHTML = data.map(function (r, i) {
      var key = r.id != null ? r.id : i;
      return "<tr><td>" + l2(TY[r.type]) + "</td><td>" + esc(r.country) + "</td><td>" + detail(r) + '</td><td class="right"><button class="btn btn-outline btn-sm" data-del="' + key + '" aria-label="Eliminar">✕</button></td></tr>';
    }).join("") || '<tr><td colspan="4" class="muted">' + L("Sin registros", "No registrations") + "</td></tr>";
    var c = { team: 0, athlete: 0, official: 0 };
    data.forEach(function (r) { c[r.type]++; });
    document.getElementById("regKpis").innerHTML =
      '<div class="kpi"><small>' + L("Equipos", "Teams") + "</small><b>" + c.team + '</b></div><div class="kpi bal"><small>' + L("Atletas", "Athletes") + "</small><b>" + c.athlete + '</b></div><div class="kpi out"><small>' + L("Oficiales", "Officials") + "</small><b>" + c.official + "</b></div>";
  }
  function setType(t) {
    type = t;
    document.querySelectorAll("#regTabs button").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.type === t)); });
    document.querySelectorAll("#regForm [data-for]").forEach(function (f) { f.hidden = f.dataset.for.split(" ").indexOf(t) < 0; });
    document.getElementById("rName").required = t !== "team";
  }

  async function load() {
    remote = !!(window.db && window.db.enabled);
    try {
      if (remote) {
        data = await window.db.listRegistros();
        var note = document.querySelector("#regForm .muted");
        if (note) note.innerHTML = L("Datos en Postgres (Supabase).", "Data in Postgres (Supabase).");
      } else {
        data = store.get("reg", null) || EX.slice();
      }
    } catch (e) {
      console.error(e);
      toast(e.message || "Error");
      data = [];
    }
    render();
  }

  document.getElementById("regTabs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setType(b.dataset.type); });
  document.getElementById("regForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var r = { type: type, country: v("rCountry"), email: v("rEmail") };
    if (type === "team") { r.head = v("rHead"); r.size = Number(v("rSize")) || 0; }
    if (type === "athlete") { r.name = v("rName"); r.event = v("rEvent"); r.issf = v("rId"); }
    if (type === "official") { r.name = v("rName"); r.role = v("rRole"); }
    try {
      if (remote) {
        r.delegation_id = (window.WCA_AUTH && window.WCA_AUTH.delegationId()) || null;
        await window.db.insertRegistro(r);
        await load();
      } else {
        data.push(r); store.set("reg", data); render();
      }
      e.target.reset();
      toast(L("Registro guardado", "Registration saved"));
    } catch (err) {
      console.error(err);
      toast(err.message || "Error");
    }
  });
  document.getElementById("regBody").addEventListener("click", async function (e) {
    var b = e.target.closest("[data-del]"); if (!b) return;
    var key = b.dataset.del;
    try {
      if (remote) {
        await window.db.deleteRegistro(key);
        await load();
      } else {
        data.splice(Number(key), 1); store.set("reg", data); render();
      }
    } catch (err) {
      toast(err.message || "Error");
    }
  });
  document.getElementById("regReset").addEventListener("click", function () {
    if (remote) {
      toast(L("En Supabase el seed se hace desde SQL/admin.", "With Supabase, seed from SQL/admin."));
      return;
    }
    data = EX.slice(); store.del("reg"); render();
  });
  document.getElementById("regCsv").addEventListener("click", function () {
    downloadCSV("registros.csv", [["tipo", "pais", "nombre", "jefe", "integrantes", "prueba", "issf_id", "funcion", "correo"]].concat(
      data.map(function (r) { return [r.type, r.country, r.name, r.head, r.size, r.event, r.issf, r.role, r.email]; })));
  });
  document.addEventListener("langchange", render);
  document.addEventListener("authready", load);
  setType("team");
  if (!window.db || !window.db.enabled) load();
})();
