/* Sesión, gate de módulos protegidos y chip de usuario en el header. */
(function () {
  var PROTECTED = { registros: 1, documentos: 1, logistica: 1, finanzas: 1, admin: 1 };
  var page = document.body.getAttribute("data-page") || "";

  window.WCA_AUTH = {
    profile: null,
    session: null,
    isStaff: function () {
      var r = this.profile && this.profile.role;
      return r === "admin" || r === "staff";
    },
    isAdmin: function () {
      return !!(this.profile && this.profile.role === "admin");
    },
    canFinance: function () {
      return this.isStaff();
    },
    delegationId: function () {
      return this.profile && this.profile.delegation_id;
    }
  };

  function redirectLogin() {
    var next = encodeURIComponent(location.pathname.split("/").pop() || "index.html");
    location.href = "login.html?next=" + next;
  }

  function paintUser() {
    var slot = document.getElementById("authSlot");
    if (!slot) return;
    var p = window.WCA_AUTH.profile;
    if (!window.db || !window.db.enabled) {
      slot.innerHTML = '<a class="auth-link" href="login.html"><span lang="es">Login</span><span lang="en">Login</span></a>';
      return;
    }
    if (!p) {
      slot.innerHTML = '<a class="auth-link" href="login.html"><span lang="es">Entrar</span><span lang="en">Sign in</span></a>';
      return;
    }
    var role = p.role || "";
    var name = esc(p.full_name || p.email || "");
    var adminLink = role === "admin"
      ? ' · <a class="auth-link" href="admin.html">Admin</a>'
      : "";
    slot.innerHTML =
      '<span class="auth-user">' + name +
      ' <small class="muted">(' + esc(role) + ')</small></span>' + adminLink +
      ' · <button type="button" class="auth-link" id="authLogout"><span lang="es">Salir</span><span lang="en">Sign out</span></button>';
    var btn = document.getElementById("authLogout");
    if (btn) {
      btn.addEventListener("click", function () {
        window.db.signOut().then(function () { location.href = "index.html"; });
      });
    }
  }

  async function boot() {
    if (!window.db || !window.db.enabled) {
      if (PROTECTED[page] && page !== "login") {
        /* Modo demo localStorage: módulos abiertos sin login. */
      }
      paintUser();
      document.dispatchEvent(new CustomEvent("authready", { detail: null }));
      return;
    }

    try {
      var session = await window.db.getSession();
      window.WCA_AUTH.session = session;
      var profile = session ? await window.db.getProfile() : null;
      window.WCA_AUTH.profile = profile;

      if (PROTECTED[page]) {
        if (!session) {
          redirectLogin();
          return;
        }
        if (!profile || !profile.active) {
          toast(L("Tu cuenta está pendiente de activación por un administrador.", "Your account is pending activation by an administrator."));
          if (page !== "login") {
            setTimeout(function () { location.href = "login.html?pending=1"; }, 800);
            return;
          }
        }
        if (page === "finanzas" && !window.WCA_AUTH.canFinance()) {
          toast(L("Finanzas solo para staff/admin.", "Finance is staff/admin only."));
          location.href = "index.html";
          return;
        }
        if (page === "admin" && !window.WCA_AUTH.isAdmin()) {
          location.href = "index.html";
          return;
        }
      }
    } catch (e) {
      console.error(e);
      toast(L("Error de sesión", "Session error"));
    }

    paintUser();
    document.dispatchEvent(new CustomEvent("authready", { detail: window.WCA_AUTH.profile }));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
