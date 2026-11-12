(function () {
  var mode = "in";
  var params = new URLSearchParams(location.search);
  var next = params.get("next") || "registros.html";
  if (next.indexOf("login") >= 0) next = "registros.html";

  function setMode(m) {
    mode = m;
    document.querySelectorAll("#loginTabs button").forEach(function (b) {
      b.setAttribute("aria-selected", String(b.dataset.mode === m));
    });
    document.getElementById("nameField").hidden = m !== "up";
    document.getElementById("loginSubmit").innerHTML = m === "up"
      ? '<span lang="es">Crear solicitud</span><span lang="en">Create request</span>'
      : '<span lang="es">Entrar</span><span lang="en">Sign in</span>';
    document.getElementById("loginHint").textContent = m === "up"
      ? L("Tras registrarte, un admin debe activar tu cuenta y asignar rol/delegación.", "After signing up, an admin must activate your account and assign role/delegation.")
      : L("Usa el correo que te asignó el comité organizador.", "Use the email assigned by the organizing committee.");
  }

  document.getElementById("loginTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) setMode(b.dataset.mode);
  });

  if (!window.db || !window.db.enabled) {
    document.getElementById("cfgHint").innerHTML =
      L("Supabase no está configurado (js/config.js). Los módulos siguen en modo localStorage.",
        "Supabase is not configured (js/config.js). Modules still use localStorage.");
  } else if (params.get("pending")) {
    document.getElementById("loginHint").textContent =
      L("Cuenta creada pero inactiva. Espera activación del administrador.",
        "Account created but inactive. Wait for administrator activation.");
  }

  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!window.db || !window.db.enabled) {
      toast(L("Configura Supabase en js/config.js", "Configure Supabase in js/config.js"));
      return;
    }
    var email = document.getElementById("lEmail").value.trim();
    var pass = document.getElementById("lPass").value;
    var name = document.getElementById("lName").value.trim();
    try {
      if (mode === "up") {
        await window.db.signUp(email, pass, name);
        toast(L("Solicitud creada. Espera activación.", "Request created. Wait for activation."));
        setMode("in");
        return;
      }
      await window.db.signIn(email, pass);
      var profile = await window.db.getProfile();
      if (!profile || !profile.active) {
        await window.db.signOut();
        toast(L("Cuenta pendiente de activación.", "Account pending activation."));
        return;
      }
      location.href = next;
    } catch (err) {
      console.error(err);
      toast(err.message || L("Error de acceso", "Access error"));
    }
  });

  setMode("in");
})();
