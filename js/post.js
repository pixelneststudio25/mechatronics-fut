/* post.js - shows one news item or event (post.html?id=...) */
(function () {
  "use strict";
  var U = window.PostsUI;
  var titleEl = document.getElementById("post-title"), metaEl = document.getElementById("post-meta"), box = document.getElementById("post");
  if (!box || !window.SB) return;
  var id = new URLSearchParams(location.search).get("id") || "";

  function notFound(msg) {
    titleEl.textContent = "Not found"; metaEl.textContent = "";
    box.innerHTML = "<p>" + msg + ' <a href="/news-events.html">Back to news and events</a></p>';
    document.title = "Not found | Mechatronics Engineering, FUT Minna";
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) { notFound("That link does not look right."); return; }

  window.SB.publicGet(id).then(function (p) {
    if (!p) { notFound("This post is not available. It may have been removed."); return; }
    var isEvent = p.kind === "event";
    titleEl.textContent = p.title;
    document.title = p.title + " | Mechatronics Engineering, FUT Minna";
    metaEl.textContent = isEvent ? U.whenText(p) + (p.venue ? ", " + p.venue : "") : U.dateLong(p.publish_at);
    var html = "";
    var cover = U.safeUrl(p.cover_url);
    if (cover) html += '<img class="article__cover" src="' + U.esc(cover) + '" alt="" decoding="async">';
    if (p.summary) html += '<p class="article__summary">' + U.esc(p.summary) + "</p>";
    html += '<div class="article__body">' + U.paragraphs(p.body) + "</div>";
    var actions = "";
    if (isEvent && p.event_start) actions += '<button type="button" class="btn btn--secondary" id="ics">Add to calendar</button>';
    if (U.safeUrl(p.link)) actions += '<a class="btn" href="' + U.esc(U.safeUrl(p.link)) + '" target="_blank" rel="noopener noreferrer">' + (isEvent ? "Register or learn more" : "Read more") + "</a>";
    if (actions) html += '<div class="post__actions" style="margin-top:var(--space-6)">' + actions + "</div>";
    box.innerHTML = html;
    var b = document.getElementById("ics"); if (b) b.addEventListener("click", function () { U.downloadIcs(p); });
  }).catch(function () { notFound("We could not load this post. Please check your connection."); });
})();
