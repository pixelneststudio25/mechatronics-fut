/* ==========================================================================
   supabase-lite.js  -  a tiny client for Supabase (no library, no CDN).
   Public pages use publicList / publicGet. The admin dashboard uses the rest.
   Exposes window.SB.
   ========================================================================== */
(function () {
  "use strict";
  var C = window.SUPABASE;
  if (!C) { console.error("supabase-lite.js: window.SUPABASE is missing. Load supabase-config.js first."); return; }
  var SESSION_KEY = "mech_admin_session";
  var CACHE_KEY = "mech_posts_cache_v1";
  var LIST_FIELDS = "id,kind,title,summary,cover_url,link,venue,publish_at,event_start,event_end";

  function headers(token, extra) {
    var h = { apikey: C.anonKey, "Content-Type": "application/json", Authorization: "Bearer " + (token || C.anonKey) };
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  async function req(path, opts) {
    var r = await fetch(C.url + path, opts);
    var text = await r.text(), data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!r.ok) {
      var msg = (data && (data.message || data.msg || data.error_description || data.error)) || "Request failed (" + r.status + ")";
      var err = new Error(msg); err.status = r.status; throw err;
    }
    return data;
  }

  /* ----- session ----- */
  function load() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function save(d, fallbackEmail) {
    var s = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600), email: (d.user && d.user.email) || fallbackEmail || "" };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  async function signIn(email, password) {
    var d = await req("/auth/v1/token?grant_type=password", { method: "POST", headers: headers(), body: JSON.stringify({ email: email, password: password }) });
    return save(d);
  }
  async function token() {
    var s = load();
    if (!s) return null;
    if (s.expires_at - 60 < Date.now() / 1000) {
      try {
        var d = await req("/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: headers(), body: JSON.stringify({ refresh_token: s.refresh_token }) });
        s = save(d, s.email);
      } catch (e) { try { localStorage.removeItem(SESSION_KEY); } catch (x) {} return null; }
    }
    return s.access_token;
  }
  async function signOut() {
    var t = await token();
    try { if (t) await fetch(C.url + "/auth/v1/logout", { method: "POST", headers: headers(t) }); } catch (e) {}
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  async function isAdmin() {
    var t = await token();
    if (!t) return false;
    try { return (await req("/rest/v1/rpc/is_admin", { method: "POST", headers: headers(t), body: "{}" })) === true; } catch (e) { return false; }
  }

  /* ----- posts (admin) ----- */
  async function rest(method, query, body, table) {
    var t = await token();
    if (!t) { var err = new Error("Your session has ended. Please sign in again."); err.status = 401; throw err; }
    return req("/rest/v1/" + (table || "posts") + (query || ""), { method: method, headers: headers(t, method === "GET" ? {} : { Prefer: "return=representation" }), body: body ? JSON.stringify(body) : undefined });
  }
  function list() { return rest("GET", "?select=*&order=updated_at.desc&limit=500"); }
  function create(p) { return rest("POST", "", p).then(function (r) { return r[0]; }); }
  function update(id, p) { return rest("PATCH", "?id=eq." + encodeURIComponent(id), p).then(function (r) { return r[0]; }); }
  function remove(id) { return rest("DELETE", "?id=eq." + encodeURIComponent(id)); }

  async function upload(blob, path, bucket) {
    bucket = bucket || "media";
    var t = await token();
    if (!t) throw new Error("Your session has ended. Please sign in again.");
    var r = await fetch(C.url + "/storage/v1/object/" + bucket + "/" + path, { method: "POST", headers: { apikey: C.anonKey, Authorization: "Bearer " + t, "Content-Type": blob.type, "x-upsert": "false" }, body: blob });
    if (!r.ok) { var d = {}; try { d = await r.json(); } catch (e) {} throw new Error(d.message || d.error || "Image upload failed (" + r.status + ")"); }
    return C.url + "/storage/v1/object/public/" + bucket + "/" + path;
  }

  /* ----- posts (public) ----- */
  async function publicList() {
    try {
      var data = await req("/rest/v1/posts?select=" + LIST_FIELDS + "&order=publish_at.desc&limit=100", { headers: headers() });
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
      return { data: data, cached: false };
    } catch (e) {
      var c = null; try { c = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (x) {}
      if (c && c.data) return { data: c.data, cached: true };
      throw e;
    }
  }
  async function publicGet(id) {
    var r = await req("/rest/v1/posts?select=*&id=eq." + encodeURIComponent(id) + "&limit=1", { headers: headers() });
    return r && r[0] ? r[0] : null;
  }

  /* ----- resources ----- */
  var RES_KEY = "mech_resources_cache_v1";
  function resList() { return rest("GET", "?select=*&order=updated_at.desc&limit=1000", null, "resources"); }
  function resCreate(p) { return rest("POST", "", p, "resources").then(function (r) { return r[0]; }); }
  function resUpdate(id, p) { return rest("PATCH", "?id=eq." + encodeURIComponent(id), p, "resources").then(function (r) { return r[0]; }); }
  function resRemove(id) { return rest("DELETE", "?id=eq." + encodeURIComponent(id), null, "resources"); }
  async function publicResources() {
    try {
      var data = await req("/rest/v1/resources?select=id,title,description,level,course_code,kind,url,file_name,updated_at&order=level.asc.nullsfirst,course_code.asc.nullslast,title.asc&limit=1000", { headers: headers() });
      try { localStorage.setItem(RES_KEY, JSON.stringify({ at: Date.now(), data: data })); } catch (e) {}
      return { data: data, cached: false };
    } catch (e) {
      var c = null; try { c = JSON.parse(localStorage.getItem(RES_KEY)); } catch (x) {}
      if (c && c.data) return { data: c.data, cached: true };
      throw e;
    }
  }

  window.SB = { signIn: signIn, signOut: signOut, session: load, isAdmin: isAdmin, list: list, create: create, update: update, remove: remove, upload: upload, publicList: publicList, publicGet: publicGet, resList: resList, resCreate: resCreate, resUpdate: resUpdate, resRemove: resRemove, publicResources: publicResources };
})();
