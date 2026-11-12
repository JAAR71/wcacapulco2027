(function () {
  var dels = [];

  async function load() {
    if (!window.db || !window.db.enabled) {
      document.getElementById("adminUsers").innerHTML =
        '<tr><td colspan="6" class="muted">' + L("Configura Supabase en js/config.js", "Configure Supabase in js/config.js") + "</td></tr>";
      return;
    }
    try {
      dels = await window.db.listDelegations();
      var users = await window.db.listProfiles();
      document.getElementById("adminDels").innerHTML = dels.map(function (d) {
        return "<tr><td><b>" + esc(d.code) + "</b></td><td>" + esc(d.name) + "</td><td>" + (d.active ? "✓" : "—") + "</td></tr>";
      }).join("") || '<tr><td colspan="3" class="muted">' + L("Sin delegaciones", "No delegations") + "</td></tr>";

      document.getElementById("adminUsers").innerHTML = users.map(function (u) {
        var opts = ["admin", "staff", "delegation"].map(function (r) {
          return '<option value="' + r + '"' + (u.role === r ? " selected" : "") + ">" + r + "</option>";
        }).join("");
        var dopts = '<option value="">—</option>' + dels.map(function (d) {
          return '<option value="' + d.id + '"' + (u.delegation_id === d.id ? " selected" : "") + ">" + esc(d.code) + "</option>";
        }).join("");
        return "<tr>" +
          "<td>" + esc(u.email || "") + "</td>" +
          '<td><input data-uid="' + u.id + '" data-k="full_name" value="' + esc(u.full_name || "") + '" style="min-width:140px"></td>' +
          '<td><select data-uid="' + u.id + '" data-k="role">' + opts + "</select></td>" +
          '<td><select data-uid="' + u.id + '" data-k="delegation_id">' + dopts + "</select></td>" +
          '<td><input type="checkbox" data-uid="' + u.id + '" data-k="active"' + (u.active ? " checked" : "") + "></td>" +
          '<td><button class="btn btn-primary btn-sm" type="button" data-save="' + u.id + '">' + L("Guardar", "Save") + "</button></td>" +
          "</tr>";
      }).join("") || '<tr><td colspan="6" class="muted">' + L("Sin usuarios", "No users") + "</td></tr>";
    } catch (e) {
      console.error(e);
      toast(e.message || "Error");
    }
  }

  document.getElementById("adminUsers").addEventListener("click", async function (e) {
    var b = e.target.closest("[data-save]"); if (!b) return;
    var id = b.dataset.save;
    var row = b.closest("tr");
    var name = row.querySelector('[data-k="full_name"]').value.trim();
    var role = row.querySelector('[data-k="role"]').value;
    var del = row.querySelector('[data-k="delegation_id"]').value || null;
    var active = row.querySelector('[data-k="active"]').checked;
    try {
      await window.db.adminSetProfile(id, role, del, active, name);
      toast(L("Usuario actualizado", "User updated"));
      load();
    } catch (err) {
      console.error(err);
      toast(err.message || "Error");
    }
  });

  document.getElementById("delForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      await window.db.upsertDelegation({
        code: document.getElementById("dCode").value.trim().toUpperCase(),
        name: document.getElementById("dName").value.trim(),
        active: true
      });
      e.target.reset();
      toast(L("Delegación guardada", "Delegation saved"));
      load();
    } catch (err) {
      console.error(err);
      toast(err.message || "Error");
    }
  });

  document.addEventListener("authready", load);
  if (window.WCA_AUTH && window.WCA_AUTH.profile) load();
})();
