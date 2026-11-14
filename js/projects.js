/* projects.js - renders project cards and the filter from window.PROJECTS (data/projects.js) */
(function () {
  "use strict";
  var list = window.PROJECTS;
  var mount = document.getElementById("project-grid");
  var filters = document.getElementById("filters");
  var count = document.getElementById("project-count");
  if (!list || !mount) return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var CHIP = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="20" y="20" width="24" height="24" rx="4"/><path d="M26 20v-9M32 20v-9M38 20v-9M26 44v9M32 44v9M38 44v9M20 26h-9M20 32h-9M20 38h-9M44 26h9M44 32h9M44 38h9"/></svg>';

  function card(p) {
    var media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="800" height="600" loading="lazy" decoding="async">'
      : '<div class="tile" aria-hidden="true">' + CHIP + "</div>";
    return '<article class="pcard" data-kind="' + esc(p.kind) + '">' +
      '<div class="pcard__media">' + media + "</div>" +
      '<div class="pcard__body">' +
        '<p class="pcard__kind">' + (p.kind === "student" ? "Student project" : "Funded research") + "</p>" +
        "<h3>" + esc(p.title) + "</h3>" +
        (p.funder ? '<p class="funder">Funded by ' + esc(p.funder) + "</p>" : "") +
        "<p>" + esc(p.abstract) + "</p>" +
        (p.students || p.supervisor ? '<dl class="people">' +
          (p.students ? "<div><dt>Built by</dt><dd>" + esc(p.students) + "</dd></div>" : "") +
          (p.supervisor ? "<div><dt>Supervisor</dt><dd>" + esc(p.supervisor) + "</dd></div>" : "") + "</dl>" : "") +
        '<ul class="tags">' + p.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      "</div></article>";
  }
  mount.innerHTML = list.map(card).join("");

  var cards = Array.prototype.slice.call(mount.querySelectorAll(".pcard"));
  function apply(kind) {
    var n = 0;
    cards.forEach(function (c) {
      var show = kind === "all" || c.getAttribute("data-kind") === kind;
      c.hidden = !show;
      if (show) n++;
    });
    if (count) count.textContent = "Showing " + n + (n === 1 ? " project" : " projects");
  }
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-kind]");
      if (!b) return;
      Array.prototype.forEach.call(filters.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      apply(b.getAttribute("data-kind"));
    });
  }
  apply("all");
})();
