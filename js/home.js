/* Cuenta regresiva a la fecha PRELIMINAR (11-mar-2027, por confirmar). */
(function () {
  var target = new Date("2027-03-11T08:00:00-06:00");
  var el = document.getElementById("countdown");
  function draw() {
    var d = Math.max(0, target - new Date());
    var parts = [[Math.floor(d / 864e5), "días", "days"], [Math.floor(d / 36e5) % 24, "horas", "hours"], [Math.floor(d / 6e4) % 60, "min", "min"], [Math.floor(d / 1e3) % 60, "seg", "sec"]];
    el.innerHTML = parts.map(function (p) { return "<div><b>" + p[0] + '</b><small>' + L(p[1], p[2]) + "</small></div>"; }).join("");
  }
  draw(); setInterval(draw, 1000);
  document.addEventListener("langchange", draw);
})();
