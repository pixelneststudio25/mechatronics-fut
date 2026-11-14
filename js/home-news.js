/* home-news.js - fills the home page "News and events" box from Supabase.
   If nothing is published yet, or the request fails, the designed empty state stays. */
(function () {
  "use strict";
  var box = document.getElementById("home-feed");
  if (!box || !window.SB || !window.PostsUI) return;
  var U = window.PostsUI, byId = {};

  window.SB.publicList().then(function (r) {
    var rows = r.data || [], now = Date.now();
    rows.forEach(function (p) { byId[p.id] = p; });
    var events = rows.filter(function (p) { return p.kind === "event" && p.event_start && new Date(p.event_end || p.event_start).getTime() >= now; })
      .sort(function (a, b) { return new Date(a.event_start) - new Date(b.event_start); }).slice(0, 2);
    var news = rows.filter(function (p) { return p.kind === "news"; })
      .sort(function (a, b) { return new Date(b.publish_at) - new Date(a.publish_at); });
    var items = events.concat(news).slice(0, 3);
    if (!items.length) return;
    box.innerHTML = '<div class="post-grid">' + items.map(function (p) { return U.cardHtml(p, "/post.html?id=" + encodeURIComponent(p.id)); }).join("") + "</div>";
  }).catch(function () { /* keep the empty state */ });

  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ics]");
    if (b && byId[b.getAttribute("data-ics")]) U.downloadIcs(byId[b.getAttribute("data-ics")]);
  });
})();
