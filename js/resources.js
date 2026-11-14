/* resources.js - the public Resources page: filters and search over Supabase data */
(function () {
  "use strict";
  var list = document.getElementById("r-list");
  if (!list || !window.SB) return;
  var U = window.PostsUI, $ = function (id) { return document.getElementById(id); };
  var KIND = { notes: "Notes", "past-questions": "Past questions", textbook: "Textbook", timetable: "Timetable", other: "Other" };
  var state = { rows: [], level: "all", kind: "all", q: "", cached: false };

  /* start from the link, for example /resources.html?level=300&kind=past-questions */
  var params = new URLSearchParams(location.search);
  if (/^(100|200|300|400|500|general)$/.test(params.get("level") || "")) state.level = params.get("level");
  if (KIND[params.get("kind")]) state.kind = params.get("kind");

  function key(s) { return String(s || "").toLowerCase().replace(/\s+/g, ""); }
  function isDrive(u) { return /^https?:\/\/(drive|docs)\.google\.com\//i.test(u); }
  function ext(name) { var m = /\.([a-z0-9]+)$/i.exec(name || ""); return m ? m[1].toUpperCase() : ""; }
  function updated(iso) { return U.dateLong(iso); }

  function card(r) {
    var url = U.safeUrl(r.url); if (!url) return "";
    var label = r.file_name ? "Download" + (ext(r.file_name) ? " " + ext(r.file_name) : "") : isDrive(url) ? "Open in Google Drive" : "Open";
    var arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
    return '<article class="res"><div class="res__tags"><span class="tag tag--kind">' + U.esc(KIND[r.kind] || "Other") + '</span><span class="tag">' + (r.level ? r.level + " level" : "All levels") + "</span></div>" +
      (r.course_code ? '<p class="res__code">' + U.esc(r.course_code) + "</p>" : "") +
      "<h3>" + U.esc(r.title) + "</h3>" + (r.description ? "<p>" + U.esc(r.description) + "</p>" : "") +
      '<div class="res__foot"><span class="res__meta">Updated ' + U.esc(updated(r.updated_at)) + '</span><a class="btn btn--secondary" href="' + U.esc(url) + '" target="_blank" rel="noopener noreferrer">' + U.esc(label) + " " + arrow + "</a></div></article>";
  }

  function render() {
    var q = key(state.q);
    var rows = state.rows.filter(function (r) {
      if (state.level === "general" ? r.level != null : state.level !== "all" && String(r.level) !== state.level) return false;
      if (state.kind !== "all" && r.kind !== state.kind) return false;
      return !q || key(r.title).indexOf(q) > -1 || key(r.course_code).indexOf(q) > -1;
    });
    $("r-count").textContent = state.rows.length ? rows.length + (rows.length === 1 ? " resource" : " resources") + (state.cached ? " (saved copy, you may be offline)" : "") : "";
    if (!state.rows.length) {
      list.innerHTML = '<div class="empty"><span class="empty__tag">Nothing here yet</span><h3>No resources have been added</h3><p>Lecture notes, past questions, textbooks and timetables will appear here as soon as the department adds them.</p></div>';
    } else if (!rows.length) {
      list.innerHTML = '<div class="empty"><span class="empty__tag">No matches</span><h3>Nothing matches these filters</h3><p>Try a different level or type, or clear the search.</p><button class="btn btn--secondary" type="button" id="reset">Clear filters</button></div>';
      $("reset").addEventListener("click", function () { state.level = "all"; state.kind = "all"; state.q = ""; $("r-search").value = ""; syncButtons(); render(); });
    } else {
      list.innerHTML = '<div class="rgrid">' + rows.map(card).join("") + "</div>";
    }
  }

  function syncButtons() {
    [["f-level", state.level], ["f-kind", state.kind]].forEach(function (g) {
      Array.prototype.forEach.call($(g[0]).querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-v") === g[1] ? "true" : "false"); });
    });
  }
  function setUrl() {
    var p = new URLSearchParams();
    if (state.level !== "all") p.set("level", state.level);
    if (state.kind !== "all") p.set("kind", state.kind);
    if (history.replaceState) history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }
  [["f-level", "level"], ["f-kind", "kind"]].forEach(function (g) {
    $(g[0]).addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]"); if (!b) return;
      state[g[1]] = b.getAttribute("data-v"); syncButtons(); setUrl(); render();
    });
  });
  $("r-search").addEventListener("input", function () { state.q = this.value.trim(); render(); });
  syncButtons();

  function load() {
    window.SB.publicResources().then(function (r) { state.rows = r.data || []; state.cached = r.cached; render(); }).catch(function () {
      list.innerHTML = '<div class="empty"><span class="empty__tag">Could not load</span><h3>Resources are unavailable</h3><p>Please check your connection and try again.</p><button class="btn btn--secondary" type="button" id="retry">Try again</button></div>';
      var b = $("retry"); if (b) b.addEventListener("click", function () { b.classList.add("is-loading"); load(); });
    });
  }
  load();
})();
