/* news-events.js - builds the news and events page from Supabase */
(function () {
  "use strict";
  var feed = document.getElementById("feed");
  if (!feed || !window.SB) return;
  var U = window.PostsUI, byId = {};

  function section(title, eyebrow, inner, alt) {
    return '<section class="section' + (alt ? " section--alt" : "") + '"><div class="container"><div class="section-head"><div><p class="eyebrow">' + eyebrow + "</p><h2>" + title + "</h2></div></div>" + inner + "</div></section>";
  }
  function empty(tag, title, text) {
    return '<div class="empty"><span class="empty__tag">' + tag + "</span><h3>" + title + "</h3><p>" + text + "</p></div>";
  }
  function grid(items) { return '<div class="post-grid">' + items.map(function (p) { return U.cardHtml(p, "/post.html?id=" + encodeURIComponent(p.id)); }).join("") + "</div>"; }

  function render(rows, cached) {
    rows.forEach(function (p) { byId[p.id] = p; });
    var now = Date.now();
    var events = rows.filter(function (p) { return p.kind === "event" && p.event_start; });
    var upcoming = events.filter(function (p) { return new Date(p.event_end || p.event_start).getTime() >= now; })
      .sort(function (a, b) { return new Date(a.event_start) - new Date(b.event_start); });
    var past = events.filter(function (p) { return upcoming.indexOf(p) < 0; })
      .sort(function (a, b) { return new Date(b.event_start) - new Date(a.event_start); });
    var news = rows.filter(function (p) { return p.kind === "news"; })
      .sort(function (a, b) { return new Date(b.publish_at) - new Date(a.publish_at); });

    var html = "";
    if (cached) html += '<section class="section" style="padding-block:var(--space-5) 0"><div class="container"><p class="empty__tag" style="display:inline-flex">Showing saved content. You may be offline.</p></div></section>';
    html += section("Upcoming events", "Mark your calendar",
      upcoming.length ? grid(upcoming) : empty("Nothing scheduled yet", "No upcoming events", "Events will appear here as soon as they are announced."), false);
    html += section("News", "Latest", news.length ? grid(news) : empty("Nothing posted yet", "No news right now", "Announcements will appear here as soon as they are posted."), true);
    if (past.length) html += section("Past events", "Archive", grid(past), false);
    feed.innerHTML = html;
  }

  feed.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ics]");
    if (b && byId[b.getAttribute("data-ics")]) U.downloadIcs(byId[b.getAttribute("data-ics")]);
  });

  function load() {
    window.SB.publicList().then(function (r) { render(r.data, r.cached); }).catch(function () {
      feed.innerHTML = '<section class="section"><div class="container">' + empty("Could not load", "News and events are unavailable", "Please check your connection and try again.") + '<p style="margin-top:var(--space-4)"><button class="btn btn--secondary" type="button" id="retry">Try again</button></p></div></section>';
      var r = document.getElementById("retry"); if (r) r.addEventListener("click", load);
    });
  }
  load();
})();
