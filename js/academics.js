/* ==========================================================================
   academics.js  -  renders the level tabs, course tables and search
   from window.CURRICULUM (data/courses.js).
   ========================================================================== */
(function () {
  "use strict";
  var D = window.CURRICULUM;
  var mount = document.getElementById("levels");
  var status = document.getElementById("status");
  var input = document.getElementById("course-search");
  var count = document.getElementById("search-count");
  if (!D || !mount) return;

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function units(list) { return list.reduce(function (n, c) { return n + (Number(c.units) || 0); }, 0); }
  function allCourses() {
    var out = [];
    D.levels.forEach(function (l) { l.semesters.forEach(function (s) { s.courses.forEach(function (c) { out.push({ c: c, level: l.level, sem: s.name }); }); }); });
    return out;
  }
  var total = allCourses().length;

  /* ----- verification notice ----- */
  function renderStatus() {
    if (!status) return;
    var link = D.officialLink ? ' <a href="' + esc(D.officialLink) + '" target="_blank" rel="noopener noreferrer">Official course outline</a>' : "";
    if (D.verified) {
      var d = new Date(D.verified);
      var text = isNaN(d) ? esc(D.verified) : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      status.innerHTML = '<span class="badge badge--ok">Verified</span><span>Checked against the official curriculum on ' + text + ".</span>" + link;
    } else {
      status.innerHTML = '<span class="badge badge--pending">Pending official curriculum</span><span>Course lists will be added once they are checked against the official curriculum.</span>' + link;
    }
  }

  /* ----- tabs and panels ----- */
  function btn(label, href) {
    var internal = href.charAt(0) === "/";
    return '<a class="btn btn--secondary btn--sm" href="' + esc(href) + '"' + (internal ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + label + "</a>";
  }
  function semesterHtml(s, lvl) {
    var head = '<h4>' + esc(s.name) + (s.courses.length ? "<small>" + s.courses.length + " courses, " + units(s.courses) + " units</small>" : "") + "</h4>";
    if (!s.courses.length) {
      return '<div class="semester">' + head + '<div class="empty-sem">The ' + esc(s.name.toLowerCase()) + " courses for " + lvl + " level will be listed here once the official curriculum is confirmed.</div></div>";
    }
    var rows = s.courses.map(function (c) {
      var core = String(c.type).toLowerCase() === "core";
      return '<tr><td class="code">' + esc(c.code) + "</td><td>" + esc(c.title) + '</td><td class="num">' + esc(c.units) + '</td><td><span class="type' + (core ? " type--core" : "") + '">' + esc(c.type) + "</span></td></tr>";
    }).join("");
    return '<div class="semester">' + head + '<div class="table-wrap"><table><caption class="visually-hidden">' + esc(s.name) + ", " + lvl + ' level</caption><thead><tr><th scope="col">Code</th><th scope="col">Course title</th><th scope="col">Units</th><th scope="col">Type</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }

  var tabsHtml = '<div class="tabs" role="tablist" aria-label="Levels">' + D.levels.map(function (l, i) {
    return '<button class="tab" role="tab" type="button" id="tab-' + l.level + '" aria-controls="panel-' + l.level + '" aria-selected="false" tabindex="-1" data-i="' + i + '"><span class="tab__level">' + l.level + '</span><span class="tab__year">Year ' + l.year + "</span></button>";
  }).join("") + "</div>";
  var panelsHtml = D.levels.map(function (l) {
    return '<div class="panel" role="tabpanel" id="panel-' + l.level + '" aria-labelledby="tab-' + l.level + '" tabindex="0" hidden>' +
      '<div class="panel__head"><h3>' + l.level + ' Level <span style="color:var(--text-muted);font-weight:500">/ Year ' + l.year + '</span></h3><div class="panel__links">' +
      btn("Materials", l.materials || "/resources.html?level=" + l.level) + btn("Past questions", l.pastQuestions || "/resources.html?level=" + l.level + "&kind=past-questions") + "</div></div>" +
      l.semesters.map(function (s) { return semesterHtml(s, l.level); }).join("") + "</div>";
  }).join("");

  var tabsWrap = document.createElement("div");
  tabsWrap.innerHTML = tabsHtml + panelsHtml;
  var resultsWrap = document.createElement("div");
  resultsWrap.className = "results";
  resultsWrap.hidden = true;
  resultsWrap.setAttribute("aria-live", "polite");
  mount.append(tabsWrap, resultsWrap);

  var tabs = Array.prototype.slice.call(tabsWrap.querySelectorAll(".tab"));
  var panels = Array.prototype.slice.call(tabsWrap.querySelectorAll(".panel"));

  function select(i, focus, updateHash) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panels[n].hidden = !on;
    });
    if (focus) tabs[i].focus();
    if (updateHash && history.replaceState) history.replaceState(null, "", "#level-" + D.levels[i].level);
  }
  tabs.forEach(function (t, n) {
    t.addEventListener("click", function () { select(n, false, true); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, next = null;
      if (k === "ArrowRight") next = (n + 1) % tabs.length;
      else if (k === "ArrowLeft") next = (n - 1 + tabs.length) % tabs.length;
      else if (k === "Home") next = 0;
      else if (k === "End") next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); select(next, true, true); }
    });
  });

  function fromHash() {
    var m = /^#level-(\d{3})$/.exec(location.hash);
    var i = m ? D.levels.findIndex(function (l) { return String(l.level) === m[1]; }) : 0;
    select(i < 0 ? 0 : i, false, false);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();

  /* ----- search ----- */
  function key(s) { return String(s).toLowerCase().replace(/\s+/g, ""); }
  function search() {
    var q = input.value.trim();
    if (q.length < 2) {
      resultsWrap.hidden = true; tabsWrap.hidden = false; count.textContent = ""; return;
    }
    tabsWrap.hidden = true; resultsWrap.hidden = false;
    if (!total) {
      resultsWrap.innerHTML = '<div class="empty-sem">There are no courses to search yet. They will appear here once the official curriculum is added.</div>';
      count.textContent = "No courses loaded yet."; return;
    }
    var kq = key(q);
    var hits = allCourses().filter(function (x) { return key(x.c.code).indexOf(kq) > -1 || key(x.c.title).indexOf(kq) > -1; });
    count.textContent = hits.length + (hits.length === 1 ? " course found" : " courses found");
    resultsWrap.innerHTML = hits.length ? hits.map(function (x) {
      return '<div class="result"><span class="result__code">' + esc(x.c.code) + '</span><span class="result__title">' + esc(x.c.title) + '</span><span class="result__meta">' + x.level + " level, " + esc(x.sem.toLowerCase()) + ", " + esc(x.c.units) + " units, " + esc(x.c.type) + "</span></div>";
    }).join("") : '<div class="empty-sem">No course matches "' + esc(q) + '". Try a course code like MEE 311 or a word from the title.</div>';
  }
  if (input) input.addEventListener("input", search);

  renderStatus();
})();
