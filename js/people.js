/* people.js - renders the staff cards from window.PEOPLE (data/people.js) */
(function () {
  "use strict";
  var list = window.PEOPLE;
  var mount = document.getElementById("people");
  if (!list || !mount) return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function card(p, featured, first) {
    var pos = p.position ? ' style="object-position:' + esc(p.position) + '"' : "";
    return '<article class="person' + (featured ? " person--featured" : "") + '">' +
      '<div class="person__photo"><img src="' + esc(p.photo) + '" alt="Portrait of ' + esc(p.name) + '" width="640" height="800"' + pos + (first ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></div>' +
      '<div class="person__body">' +
        '<h' + (featured ? "2" : "3") + ' class="person__name">' + esc(p.name) + "</h" + (featured ? "2" : "3") + ">" +
        '<ul class="person__roles">' + p.roles.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" +
        '<p class="person__label">Expertise</p>' +
        '<ul class="tags">' + p.expertise.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
        (p.email ? '<a class="person__mail" href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>" : "") +
      "</div></article>";
  }
  mount.innerHTML =
    card(list[0], true, true) +
    (list.length > 1 ? '<div class="people-grid">' + list.slice(1).map(function (p) { return card(p, false, false); }).join("") + "</div>" : "");
})();
