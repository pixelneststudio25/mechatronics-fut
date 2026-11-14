/* ==========================================================================
   resources.js (admin)  -  add, edit and remove resources.
   Works with admin.js (shares AdminKit) and supabase-lite.js (SB).
   ========================================================================== */
(function () {
  "use strict";
  var Kit = window.AdminKit, SB = window.SB, U = window.PostsUI;
  if (!Kit || !SB || !U) return;
  var $ = function (id) { return document.getElementById(id); };
  var KIND = { notes: "Notes", "past-questions": "Past questions", textbook: "Textbook", timetable: "Timetable", other: "Other" };
  var MAX = 25 * 1024 * 1024, EXT = /\.(pdf|docx?|pptx?|xlsx?|zip)$/i;
  var state = { rows: [], filter: "all", q: "", editing: null, file: null };

  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }

  /* ----- list ----- */
  async function refresh() {
    try { state.rows = await SB.resList(); render(); }
    catch (e) {
      if (e.status === 401) Kit.showLogin("Please sign in again.");
      else $("r-rows").innerHTML = '<li class="none">Resources could not be loaded: ' + U.esc(e.message) + ". If you have not run resources.sql in Supabase yet, do that first.</li>";
    }
  }
  function render() {
    var q = state.q.toLowerCase();
    var rows = state.rows.filter(function (r) {
      if (state.filter !== "all" && r.status !== state.filter) return false;
      return !q || r.title.toLowerCase().indexOf(q) > -1 || (r.course_code || "").toLowerCase().indexOf(q) > -1;
    });
    $("r-count").textContent = rows.length + (rows.length === 1 ? " resource" : " resources");
    if (!rows.length) {
      $("r-rows").innerHTML = '<li class="none">' + (state.rows.length ? "No resources match this view." : "Nothing here yet. Click New resource to add your first one.") + "</li>";
      return;
    }
    $("r-rows").innerHTML = rows.map(function (r) {
      return '<li class="row row--' + r.status + '"><div class="row__main"><div class="row__sub"><span class="chip chip--kind">' + U.esc(KIND[r.kind] || "Other") + '</span><span class="chip chip--level">' + (r.level ? r.level + " level" : "All levels") + '</span><span class="chip chip--' + (r.status === "published" ? "live" : "draft") + '">' + (r.status === "published" ? "Published" : "Draft") + "</span></div>" +
        '<span class="row__title">' + U.esc(r.title) + '</span><div class="row__sub">' + (r.course_code ? "<span>" + U.esc(r.course_code) + "</span>" : "") +
        '<a class="row__link" href="' + U.esc(U.safeUrl(r.url)) + '" target="_blank" rel="noopener noreferrer">' + (r.file_name ? U.esc(r.file_name) : U.esc(host(r.url))) + "</a>" +
        (r.updated_by ? "<span>Last edited by " + U.esc(r.updated_by) + "</span>" : "") + "</div></div>" +
        '<div class="row__actions"><button class="btn btn--secondary" type="button" data-act="edit" data-id="' + U.esc(r.id) + '">Edit</button><button class="btn btn--secondary" type="button" data-act="delete" data-id="' + U.esc(r.id) + '">Delete</button></div></li>';
    }).join("");
  }
  $("r-filters").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]"); if (!b) return;
    state.filter = b.getAttribute("data-f");
    Array.prototype.forEach.call($("r-filters").querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    render();
  });
  $("r-q").addEventListener("input", function () { state.q = this.value.trim(); render(); });
  $("r-rows").addEventListener("click", async function (e) {
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var r = state.rows.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0]; if (!r) return;
    if (b.getAttribute("data-act") === "edit") { openEditor(r); return; }
    if (await Kit.confirmDelete(r)) {
      Kit.busy(b, true);
      try { await SB.resRemove(r.id); Kit.toast("Resource deleted."); await refresh(); } catch (err) { Kit.busy(b, false); Kit.toast(err.message, true); }
    }
  });

  /* ----- editor ----- */
  var ed = $("r-editor"), form = $("r-form");
  function source() { return form.querySelector('input[name="source"]:checked').value; }
  function showSource() {
    var up = source() === "upload";
    $("rf-link-box").hidden = up; $("rf-file-box").hidden = !up;
  }
  form.addEventListener("change", function (e) { if (e.target.name === "source") showSource(); });
  $("rf-file").addEventListener("change", function () {
    var f = this.files[0]; $("r-error").textContent = "";
    if (!f) { state.file = null; $("rf-file-name").textContent = existingName() || "No file chosen"; return; }
    if (!EXT.test(f.name)) { $("r-error").textContent = "Please choose a PDF, Word, PowerPoint, Excel or ZIP file."; this.value = ""; return; }
    if (f.size > MAX) { $("r-error").textContent = "That file is over 25 MB. Please upload a smaller one or paste a link instead."; this.value = ""; return; }
    state.file = f; $("rf-file-name").textContent = f.name + " (" + (f.size / 1048576).toFixed(1) + " MB)";
  });
  function existingName() { return state.editing && state.editing.file_name ? state.editing.file_name + " (current file)" : ""; }

  function openEditor(r) {
    state.editing = r || null; state.file = null;
    form.reset(); $("r-error").textContent = ""; $("rf-file").value = "";
    $("r-ed-title").textContent = r ? "Edit resource" : "New resource";
    if (r) {
      $("rf-title").value = r.title; $("rf-kind").value = r.kind; $("rf-level").value = r.level || ""; $("rf-code").value = r.course_code || "";
      $("rf-desc").value = r.description || ""; $("rf-status").value = r.status;
      if (r.file_name) { form.querySelector('input[name="source"][value="upload"]').checked = true; } else { $("rf-url").value = r.url; }
    }
    $("rf-file-name").textContent = existingName() || "No file chosen";
    showSource(); ed.showModal(); $("rf-title").focus();
  }
  $("r-new").addEventListener("click", function () { openEditor(null); });
  $("r-close").addEventListener("click", function () { ed.close(); });
  $("r-cancel").addEventListener("click", function () { ed.close(); });

  function safeName(n) { return n.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-80) || "file"; }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var err = $("r-error"); err.textContent = "";
    var title = $("rf-title").value.trim(), up = source() === "upload", url = $("rf-url").value.trim();
    if (!title) { err.textContent = "Please add a title."; $("rf-title").focus(); return; }
    if (!up) {
      if (!/^https?:\/\//i.test(url)) { err.textContent = "Please paste a link that starts with https://"; $("rf-url").focus(); return; }
    } else if (!state.file && !(state.editing && state.editing.file_name)) { err.textContent = "Please choose a file to upload."; return; }

    var btn = $("r-save"); Kit.busy(btn, true);
    try {
      var finalUrl = url, fileName = null;
      if (up) {
        if (state.file) {
          finalUrl = await SB.upload(state.file, "resources/" + Date.now() + "-" + safeName(state.file.name), "files");
          fileName = state.file.name;
        } else { finalUrl = state.editing.url; fileName = state.editing.file_name; }
      }
      var payload = { title: title, kind: $("rf-kind").value, level: $("rf-level").value ? Number($("rf-level").value) : null, course_code: $("rf-code").value.trim() || null,
        description: $("rf-desc").value.trim() || null, url: finalUrl, file_name: fileName, status: $("rf-status").value };
      if (state.editing) await SB.resUpdate(state.editing.id, payload); else await SB.resCreate(payload);
      ed.close();
      Kit.toast(payload.status === "published" ? "Saved and live on the Resources page." : "Saved as a draft.");
      await refresh();
    } catch (ex) {
      if (ex.status === 401) { ed.close(); Kit.showLogin("Please sign in again."); } else err.textContent = ex.message;
    }
    Kit.busy(btn, false);
  });

  window.AdminResources = { refresh: refresh };
})();
