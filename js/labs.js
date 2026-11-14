/* labs.js - renders the laboratory cards from window.LABS (data/labs.js) */
(function () {
  "use strict";
  var list = window.LABS, mount = document.getElementById("labs");
  if (!list || !mount) return;
  function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  var CHIP = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="20" y="20" width="24" height="24" rx="4"/><path d="M26 20v-9M32 20v-9M38 20v-9M26 44v9M32 44v9M38 44v9M20 26h-9M20 32h-9M20 38h-9M44 26h9M44 32h9M44 38h9"/></svg>';
  mount.innerHTML = list.map(function (l) {
    var media = l.photo ? '<img src="' + esc(l.photo) + '" alt="' + esc(l.alt) + '" width="800" height="600" loading="lazy" decoding="async">' : '<div class="tile" aria-hidden="true">' + CHIP + "</div>";
    var eq = l.equipment && l.equipment.length
      ? '<p class="lab__label">Equipment</p><ul class="tags">' + l.equipment.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>"
      : '<p class="lab__soon">Equipment list to be added.</p>';
    return '<article class="lab"><div class="lab__media">' + media + '</div><div class="lab__body"><h3>' + esc(l.name) + "</h3><p>" + esc(l.summary) + "</p>" + eq + "</div></article>";
  }).join("");
})();
