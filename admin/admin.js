/* ==========================================================================
   admin.js  -  the news and events dashboard
   ========================================================================== */
(function () {
  "use strict";
  var SB = window.SB, U = window.PostsUI;
  if (!SB || !U) return;
  var $ = function (id) { return document.getElementById(id); };
  var state = { posts: [], filter: "all", q: "", editing: null, newCover: null, newCoverUrl: "", coverRemoved: false };

  /* ---------- small helpers ---------- */
  var toastTimer;
  function toast(msg, isErr) {
    var t = $("toast");
    t.textContent = msg; t.className = "toast show" + (isErr ? " error" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "toast"; }, 3800);
  }
  function toLocalInput(iso) {
    if (!iso) return "";
    var d = new Date(iso); if (isNaN(d)) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  function toIso(v) { if (!v) return null; var d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
  function statusOf(p) {
    if (p.status !== "published") return "draft";
    return new Date(p.publish_at).getTime() > Date.now() ? "scheduled" : "live";
  }
  var STATUS_LABEL = { draft: "Draft", scheduled: "Scheduled", live: "Live" };

  /* ---------- sign in / out ---------- */
  function showLogin(msg) { $("app").hidden = true; $("login").hidden = false; $("login-error").textContent = msg || ""; }
  async function showApp() {
    $("login").hidden = true; $("app").hidden = false;
    $("who").textContent = (SB.session() || {}).email || "";
    await refresh();
  }
  $("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = $("login-btn"); btn.disabled = true; btn.textContent = "Signing in...";
    $("login-error").textContent = "";
    try {
      await SB.signIn($("l-email").value.trim(), $("l-pass").value);
      if (!(await SB.isAdmin())) { await SB.signOut(); $("login-error").textContent = "This account does not have admin access."; }
      else { $("l-pass").value = ""; await showApp(); }
    } catch (err) { $("login-error").textContent = err.message === "Invalid login credentials" ? "Wrong email or password." : err.message; }
    btn.disabled = false; btn.textContent = "Sign in";
  });
  $("signout").addEventListener("click", async function () { await SB.signOut(); showLogin(); });

  /* ---------- list ---------- */
  async function refresh() {
    try { state.posts = await SB.list(); renderList(); }
    catch (e) { if (e.status === 401 || e.status === 403) showLogin("Please sign in again."); else toast(e.message, true); }
  }
  function renderList() {
    var q = state.q.toLowerCase();
    var rows = state.posts.filter(function (p) {
      if (state.filter === "news" && p.kind !== "news") return false;
      if (state.filter === "event" && p.kind !== "event") return false;
      if (state.filter === "draft" && p.status !== "draft") return false;
      return !q || p.title.toLowerCase().indexOf(q) > -1;
    });
    $("count").textContent = rows.length + (rows.length === 1 ? " post" : " posts");
    if (!rows.length) {
      $("rows").innerHTML = '<li class="none">' + (state.posts.length ? "No posts match this view." : "Nothing here yet. Click New post to add your first news item or event.") + "</li>";
      return;
    }
    $("rows").innerHTML = rows.map(function (p) {
      var st = statusOf(p);
      var when = p.kind === "event" && p.event_start ? "Event on " + U.dateLong(p.event_start) : "Publishes " + U.dateLong(p.publish_at);
      return '<li class="row"><div class="row__main"><div class="row__sub"><span class="chip chip--' + p.kind + '">' + (p.kind === "event" ? "Event" : "News") + '</span><span class="chip chip--' + st + '">' + STATUS_LABEL[st] + "</span></div>" +
        '<span class="row__title">' + U.esc(p.title) + '</span><div class="row__sub"><span>' + U.esc(when) + "</span>" + (p.updated_by ? "<span>Last edited by " + U.esc(p.updated_by) + "</span>" : "") + "</div></div>" +
        '<div class="row__actions">' + (st === "live" ? '<a class="btn btn--secondary" href="/post.html?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener">View</a>' : "") +
        '<button class="btn btn--secondary" type="button" data-act="edit" data-id="' + U.esc(p.id) + '">Edit</button>' +
        '<button class="btn btn--secondary" type="button" data-act="delete" data-id="' + U.esc(p.id) + '">Delete</button></div></li>';
    }).join("");
  }
  $("filters").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]"); if (!b) return;
    state.filter = b.getAttribute("data-f");
    Array.prototype.forEach.call($("filters").querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderList();
  });
  $("q").addEventListener("input", function () { state.q = this.value.trim(); renderList(); });
  $("rows").addEventListener("click", async function (e) {
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var p = state.posts.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0];
    if (!p) return;
    if (b.getAttribute("data-act") === "edit") openEditor(p);
    else if (await confirmDelete(p)) {
      try { await SB.remove(p.id); toast("Post deleted."); await refresh(); } catch (err) { toast(err.message, true); }
    }
  });

  /* ---------- confirm ---------- */
  function confirmDelete(p) {
    return new Promise(function (resolve) {
      var d = $("confirm");
      $("cf-text").textContent = "\u201C" + p.title + "\u201D will be removed from the website. This cannot be undone.";
      d.returnValue = "";
      d.addEventListener("close", function once() { d.removeEventListener("close", once); resolve(d.returnValue === "ok"); });
      d.showModal();
    });
  }

  /* ---------- editor ---------- */
  var ed = $("editor"), form = $("ed-form");
  function kind() { return form.querySelector('input[name="kind"]:checked').value; }
  function readForm() {
    var isEvent = kind() === "event";
    return {
      kind: kind(), title: $("f-title").value.trim(), summary: $("f-summary").value.trim(), body: $("f-body").value.trim(),
      link: $("f-link").value.trim(), venue: isEvent ? $("f-venue").value.trim() : "", status: $("f-status").value,
      publish_at: toIso($("f-publish").value), event_start: isEvent ? toIso($("f-start").value) : null, event_end: isEvent ? toIso($("f-end").value) : null
    };
  }
  function currentCover() {
    if (state.newCover) return "https://preview.invalid/cover";
    if (state.coverRemoved) return null;
    return state.editing ? state.editing.cover_url : null;
  }
  function updatePreview() {
    var f = readForm();
    $("event-fields").hidden = f.kind !== "event";
    var p = { id: "", kind: f.kind, title: f.title || "Untitled", summary: f.summary, cover_url: currentCover(), link: f.link, venue: f.venue, publish_at: f.publish_at || new Date().toISOString(), event_start: f.event_start, event_end: f.event_end };
    $("preview").innerHTML = U.cardHtml(p, null);
    var img = $("preview").querySelector(".post__media img");
    if (img && state.newCover) img.src = state.newCoverUrl;
    var url = state.newCover ? state.newCoverUrl : currentCover();
    $("cover-img").hidden = !url; if (url) $("cover-img").src = url;
    $("cover-remove").hidden = !url;
  }
  function openEditor(p) {
    state.editing = p || null; state.newCover = null; state.coverRemoved = false;
    if (state.newCoverUrl) { URL.revokeObjectURL(state.newCoverUrl); state.newCoverUrl = ""; }
    form.reset(); $("ed-error").textContent = ""; $("f-cover").value = "";
    $("ed-title").textContent = p ? "Edit post" : "New post";
    if (p) {
      form.querySelector('input[name="kind"][value="' + p.kind + '"]').checked = true;
      $("f-title").value = p.title; $("f-summary").value = p.summary || ""; $("f-body").value = p.body || "";
      $("f-link").value = p.link || ""; $("f-venue").value = p.venue || ""; $("f-status").value = p.status;
      $("f-publish").value = toLocalInput(p.publish_at); $("f-start").value = toLocalInput(p.event_start); $("f-end").value = toLocalInput(p.event_end);
    } else {
      $("f-publish").value = toLocalInput(new Date().toISOString());
    }
    updatePreview();
    ed.showModal();
    $("f-title").focus();
  }
  $("new").addEventListener("click", function () { openEditor(null); });
  $("ed-close").addEventListener("click", function () { ed.close(); });
  $("ed-cancel").addEventListener("click", function () { ed.close(); });
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);

  /* cover image: resize and convert to WebP in the browser */
  async function toWebp(file) {
    var bmp = await createImageBitmap(file);
    var scale = Math.min(1, 1600 / bmp.width);
    var c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    var blob = await new Promise(function (r) { c.toBlob(r, "image/webp", 0.82); });
    if (!blob || blob.type !== "image/webp") blob = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.85); });
    return blob;
  }
  $("f-cover").addEventListener("change", async function () {
    var file = this.files[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { $("ed-error").textContent = "Please choose a JPG, PNG or WebP image."; this.value = ""; return; }
    if (file.size > 15 * 1024 * 1024) { $("ed-error").textContent = "That image is over 15 MB. Please choose a smaller one."; this.value = ""; return; }
    try {
      var blob = await toWebp(file);
      if (state.newCoverUrl) URL.revokeObjectURL(state.newCoverUrl);
      state.newCover = blob; state.newCoverUrl = URL.createObjectURL(blob); state.coverRemoved = false; $("ed-error").textContent = "";
      updatePreview();
    } catch (e) { $("ed-error").textContent = "That image could not be read. Try a different file."; }
  });
  $("cover-remove").addEventListener("click", function () {
    state.newCover = null; state.coverRemoved = true;
    if (state.newCoverUrl) { URL.revokeObjectURL(state.newCoverUrl); state.newCoverUrl = ""; }
    $("f-cover").value = ""; updatePreview();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = readForm(), err = $("ed-error");
    err.textContent = "";
    if (!f.title) { err.textContent = "Please add a title."; $("f-title").focus(); return; }
    if (f.kind === "event" && !f.event_start) { err.textContent = "Please set when the event starts."; $("f-start").focus(); return; }
    if (f.event_end && f.event_start && new Date(f.event_end) < new Date(f.event_start)) { err.textContent = "The end time must be after the start time."; $("f-end").focus(); return; }
    if (f.link && !/^https?:\/\//i.test(f.link)) { err.textContent = "The link must start with https://"; $("f-link").focus(); return; }
    if (!f.publish_at) f.publish_at = new Date().toISOString();

    var btn = $("ed-save"); btn.disabled = true; btn.textContent = "Saving...";
    try {
      var cover = state.editing ? state.editing.cover_url : null;
      if (state.coverRemoved) cover = null;
      if (state.newCover) {
        var ext = state.newCover.type === "image/webp" ? "webp" : "jpg";
        cover = await SB.upload(state.newCover, "covers/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext);
      }
      var payload = { kind: f.kind, title: f.title, summary: f.summary || null, body: f.body || null, cover_url: cover, link: f.link || null, venue: f.venue || null, status: f.status, publish_at: f.publish_at, event_start: f.event_start, event_end: f.event_end };
      if (state.editing) await SB.update(state.editing.id, payload); else await SB.create(payload);
      ed.close();
      toast(f.status === "draft" ? "Saved as a draft." : new Date(f.publish_at) > new Date() ? "Saved. It will go live on the publish date." : "Saved and live on the website.");
      await refresh();
    } catch (ex) {
      if (ex.status === 401) { ed.close(); showLogin("Please sign in again."); }
      else err.textContent = ex.message;
    }
    btn.disabled = false; btn.textContent = "Save";
  });

  /* ---------- start ---------- */
  if (SB.session()) SB.isAdmin().then(function (ok) { if (ok) showApp(); else showLogin(); });
  else showLogin();
})();
