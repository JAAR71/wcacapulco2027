/* Layout común: banner de borrador, barra superior, header, footer e idioma.
   Sin build: cada página carga este archivo con <script src="js/layout.js">. */
(function () {
  var LINKS = {
    ssc: "https://shootingsportscloud.com",
    issf: "https://www.issf-sports.org/",
    issfComp: "https://www.issf-sports.org/competitions",
    issfNews2027: "https://www.issf-sports.org/news/4846",
    sius: "https://www.sius.com/",
    femeti: "https://www.femeti.org.mx/"
  };
  window.SITE_LINKS = LINKS;

  var NAV = [
    { id: "inicio", href: "index.html", es: "Inicio", en: "Home" },
    { id: "informacion", href: "informacion.html", es: "Información general", en: "General information" },
    { id: "programa", href: "programa.html", es: "Programa", en: "Schedule" },
    { id: "sede", href: "sede.html", es: "Sede y campo", en: "Venue & range" },
    { group: true, es: "Delegaciones", en: "Delegations", items: [
      { id: "registros", href: "registros.html", es: "Registros", en: "Registrations" },
      { id: "documentos", href: "documentos.html", es: "Documentos y permisos", en: "Documents & permits" },
      { id: "logistica", href: "logistica.html", es: "Logística", en: "Logistics" }
    ]},
    { id: "resultados", href: "resultados.html", es: "Resultados", en: "Results" },
    { id: "contacto", href: "contacto.html", es: "Contacto", en: "Contact" }
  ];

  function t(o) { return '<span lang="es">' + o.es + '</span><span lang="en">' + o.en + "</span>"; }
  var page = document.body.getAttribute("data-page") || "";

  function navHtml() {
    return "<ul>" + NAV.map(function (n) {
      if (n.group) {
        var act = n.items.some(function (i) { return i.id === page; });
        return '<li class="dropdown' + (act ? " active" : "") + '"><span class="group-title" tabindex="0">' + t(n) + '</span><ul class="sub">' +
          n.items.map(function (i) { return '<li><a href="' + i.href + '"' + (i.id === page ? ' class="active" aria-current="page"' : "") + ">" + t(i) + "</a></li>"; }).join("") + "</ul></li>";
      }
      return '<li><a href="' + n.href + '"' + (n.id === page ? ' class="active" aria-current="page"' : "") + ">" + t(n) + "</a></li>";
    }).join("") + "</ul>";
  }

  var top =
    '<div class="draft" role="status"><span lang="es">PROPUESTA / BORRADOR — NO PUBLICADO · Los datos marcados “Ejemplo” son ficticios</span>' +
    '<span lang="en">PROPOSAL / DRAFT — NOT PUBLISHED · Data marked “Example” is placeholder only</span></div>' +
    '<div class="topbar"><div class="wrap"><div class="official">' +
    '<a href="' + LINKS.ssc + '" target="_blank" rel="noopener">★ ' + t({ es: "Inscripción oficial ISSF (shootingsportscloud)", en: "Official ISSF entries (shootingsportscloud)" }) + "</a>" +
    '<a href="' + LINKS.issf + '" target="_blank" rel="noopener">issf-sports.org</a>' +
    '<a href="' + LINKS.femeti + '" target="_blank" rel="noopener">FEMETI</a></div>' +
    '<div class="langs" role="group" aria-label="Idioma / Language"><button type="button" data-set-lang="es">ES</button><button type="button" data-set-lang="en">EN</button></div></div></div>' +
    '<header class="header"><div class="wrap">' +
    '<a class="brand" href="index.html"><img src="assets/img/logo-emblema.jpg" alt="Logo Acapulco 2027 (propuesta)"><span><strong>ACAPULCO 2027</strong>' +
    "<small>" + t({ es: "Copa del Mundo de Escopeta · Guerrero, México", en: "Shotgun World Cup · Guerrero, Mexico" }) + "</small></span></a>" +
    '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menú">☰</button>' +
    '<nav class="nav" id="nav" aria-label="Principal">' + navHtml() + "</nav></div></header>";

  var foot =
    '<footer class="footer"><div class="stripe"></div><div class="wrap"><div class="cols">' +
    '<div><div class="flogo"><img src="assets/img/logo-emblema.jpg" alt=""><div><strong style="color:#fff">ACAPULCO 2027</strong><br>' +
    t({ es: "Copa del Mundo ISSF de Escopeta", en: "ISSF World Cup Shotgun" }) + "</div></div>" +
    "<p>" + t({ es: "Comité Organizador Local (por confirmar). Organiza: FEMETI. Sede: Club Caza, Tiro y Pesca de Acapulco.", en: "Local Organizing Committee (to be confirmed). Organizer: FEMETI. Venue: Club Caza, Tiro y Pesca de Acapulco." }) + "</p>" +
    '<p class="muted" style="color:#8d939a">' + t({ es: "Sitio local de información y logística. No sustituye los sistemas oficiales de la ISSF.", en: "Local information & logistics site. It does not replace official ISSF systems." }) + "</p></div>" +
    "<div><h4>" + t({ es: "Evento", en: "Event" }) + '</h4><ul><li><a href="informacion.html">' + t({ es: "Información general", en: "General information" }) + '</a></li><li><a href="programa.html">' + t({ es: "Programa", en: "Schedule" }) + '</a></li><li><a href="sede.html">' + t({ es: "Sede y campo de tiro", en: "Venue & range" }) + '</a></li><li><a href="resultados.html">' + t({ es: "Resultados", en: "Results" }) + "</a></li></ul></div>" +
    "<div><h4>" + t({ es: "Delegaciones", en: "Delegations" }) + '</h4><ul><li><a href="registros.html">' + t({ es: "Registros", en: "Registrations" }) + '</a></li><li><a href="documentos.html">' + t({ es: "Documentos y permisos", en: "Documents & permits" }) + '</a></li><li><a href="logistica.html">' + t({ es: "Logística", en: "Logistics" }) + '</a></li><li><a href="finanzas.html">' + t({ es: "Finanzas", en: "Finance" }) + "</a></li></ul></div>" +
    "<div><h4>" + t({ es: "Enlaces oficiales", en: "Official links" }) + '</h4><ul><li><a href="' + LINKS.ssc + '" target="_blank" rel="noopener">shootingsportscloud.com</a></li><li><a href="' + LINKS.issf + '" target="_blank" rel="noopener">issf-sports.org</a></li><li><a href="' + LINKS.sius + '" target="_blank" rel="noopener">Sius</a></li><li><a href="' + LINKS.femeti + '" target="_blank" rel="noopener">femeti.org.mx</a></li></ul></div>' +
    '</div></div><div class="bottom">' + t({ es: "© 2027 Comité Organizador Acapulco 2027 · Propuesta de diseño — borrador no publicado · Logo sujeto a aprobación ISSF (Guidelines art. 13.1)", en: "© 2027 Acapulco 2027 Organizing Committee · Design proposal — unpublished draft · Logo subject to ISSF approval (Guidelines art. 13.1)" }) + "</div></footer>" +
    '<div class="toast" id="toast" role="status" aria-live="polite"></div>';

  document.body.insertAdjacentHTML("afterbegin", top);
  document.body.insertAdjacentHTML("beforeend", foot);

  // Idioma (español por defecto)
  function setLang(l) {
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.lang = l;
    try { localStorage.setItem("wca27_lang", l); } catch (e) {}
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    document.querySelectorAll("[data-ph-es]").forEach(function (el) { el.placeholder = el.getAttribute("data-ph-" + l) || ""; });
    document.querySelectorAll("option[data-es]").forEach(function (o) { o.textContent = o.getAttribute("data-" + l); });
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }
  var saved = null;
  try { saved = localStorage.getItem("wca27_lang"); } catch (e) {}
  window.getLang = function () { return document.documentElement.getAttribute("data-lang") || "es"; };
  window.setLang = setLang;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) setLang(b.getAttribute("data-set-lang"));
  });
  setLang(saved === "en" ? "en" : "es");

  // Menú móvil
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  // Utilidades compartidas
  window.fmtMoney = function (n) {
    return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  window.toast = function (msg) {
    var el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(window.__tt); window.__tt = setTimeout(function () { el.classList.remove("show"); }, 2200);
  };
  window.store = {
    get: function (k, d) { try { var v = localStorage.getItem("wca27_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("wca27_" + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem("wca27_" + k); } catch (e) {} }
  };
  window.L = function (es, en) { return getLang() === "en" ? en : es; };
  window.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  window.downloadCSV = function (name, rows) {
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  };
})();
