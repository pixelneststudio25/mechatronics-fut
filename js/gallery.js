/* ==========================================================================
   gallery.js  -  gallery grid, category filter and photo viewer (lightbox)
   Data: data/gallery.js
   ========================================================================== */
(function () {
  "use strict";
  var all = window.GALLERY || [], cats = window.GALLERY_CATEGORIES || {};
  var grid = document.getElementById("g-grid");
  if (!grid) return;
  var $ = function (id) { return document.getElementById(id); };
  function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }

  var state = { cat: "all", view: all.slice(), idx: 0 };

  /* ----- filters ----- */
  function renderFilters() {
    var keys = Object.keys(cats).filter(function (k) { return all.some(function (p) { return p.category === k; }); });
    if (keys.length < 2) { $("g-filters").hidden = true; return; }
    var html = '<button type="button" data-c="all" aria-pressed="true">All (' + all.length + ")</button>";
    keys.forEach(function (k) {
      var n = all.filter(function (p) { return p.category === k; }).length;
      html += '<button type="button" data-c="' + esc(k) + '" aria-pressed="false">' + esc(cats[k]) + " (" + n + ")</button>";
    });
    $("g-filters").innerHTML = html;
  }
  $("g-filters").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-c]"); if (!b) return;
    state.cat = b.getAttribute("data-c");
    Array.prototype.forEach.call($("g-filters").querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderGrid();
  });

  /* ----- grid ----- */
  function renderGrid() {
    state.view = all.filter(function (p) { return state.cat === "all" || p.category === state.cat; });
    $("g-count").textContent = all.length ? state.view.length + (state.view.length === 1 ? " photo" : " photos") : "";
    if (!all.length) {
      grid.innerHTML = '<li class="g-empty"><span class="g-tag">Nothing here yet</span><h2>No photos have been added</h2><p>Photos from department events and projects will appear here.</p></li>';
      return;
    }
    grid.innerHTML = state.view.map(function (p, i) {
      var ratio = p.w && p.h ? p.w + " / " + p.h : "4 / 3";
      return '<li><button class="g-item" type="button" data-i="' + i + '" style="aspect-ratio:' + ratio + '" aria-label="Open photo: ' + esc(p.caption || p.alt) + '">' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '"' + (p.w && p.h ? ' width="' + p.w + '" height="' + p.h + '"' : "") + ' loading="lazy" decoding="async">' +
        (p.caption ? '<span class="g-cap">' + esc(p.caption) + "</span>" : "") + "</button></li>";
    }).join("");
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".g-item"); if (!b) return;
    openAt(Number(b.getAttribute("data-i")));
  });

  /* ----- viewer ----- */
  var lb = $("lb"), img = $("lb-img");
  function show(i) {
    var n = state.view.length;
    state.idx = (i + n) % n;
    var p = state.view[state.idx];
    img.classList.add("is-loading");
    img.onload = function () { img.classList.remove("is-loading"); };
    img.src = p.src; img.alt = p.alt;
    $("lb-cap").textContent = p.caption || "";
    $("lb-cap").hidden = !p.caption;
    $("lb-count").textContent = (state.idx + 1) + " of " + n;
    var single = n < 2;
    $("lb-prev").hidden = single; $("lb-next").hidden = single;
    [state.idx + 1, state.idx - 1].forEach(function (k) { var q = state.view[(k + n) % n]; if (q) { var pre = new Image(); pre.src = q.src; } });
  }
  function openAt(i) {
    show(i);
    document.documentElement.classList.add("lb-open");
    lb.showModal();
  }
  function closeLb() { lb.close(); }
  lb.addEventListener("close", function () { document.documentElement.classList.remove("lb-open"); img.removeAttribute("src"); });
  $("lb-close").addEventListener("click", closeLb);
  $("lb-prev").addEventListener("click", function () { show(state.idx - 1); });
  $("lb-next").addEventListener("click", function () { show(state.idx + 1); });
  $("lb-stage").addEventListener("click", function (e) { if (e.target === this || e.target.classList.contains("lb__fig")) closeLb(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(state.idx - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(state.idx + 1); }
  });
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50 && state.view.length > 1) show(state.idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  renderFilters();
  renderGrid();
})();
