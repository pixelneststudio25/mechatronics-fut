/* ==========================================================================
   posts-ui.js  -  shared helpers for showing news and events:
   escaping, dates, post cards, and the "Add to calendar" (.ics) download.
   Used by the public pages and by the admin preview. Exposes window.PostsUI.
   ========================================================================== */
(function () {
  "use strict";
  var TZ = "Africa/Lagos";

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }
  function fmt(iso, opts) { var d = new Date(iso); return isNaN(d) ? "" : new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: TZ }, opts)).format(d); }
  function dateLong(iso) { return fmt(iso, { day: "numeric", month: "long", year: "numeric" }); }
  function timeOnly(iso) { return fmt(iso, { hour: "numeric", minute: "2-digit", hour12: true }); }
  function whenText(p) {
    if (!p.event_start) return "";
    var s = dateLong(p.event_start) + ", " + timeOnly(p.event_start);
    if (p.event_end) {
      var sameDay = fmt(p.event_start, { dateStyle: "short" }) === fmt(p.event_end, { dateStyle: "short" });
      s += sameDay ? " to " + timeOnly(p.event_end) : " to " + dateLong(p.event_end) + ", " + timeOnly(p.event_end);
    }
    return s;
  }
  function paragraphs(text) {
    return String(text || "").split(/\n{2,}/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t) { return "<p>" + esc(t).replace(/\n/g, "<br>") + "</p>"; }).join("");
  }

  /* ----- calendar file ----- */
  function icsStamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function icsText(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function downloadIcs(p) {
    var start = new Date(p.event_start);
    if (isNaN(start)) return;
    var end = p.event_end ? new Date(p.event_end) : new Date(start.getTime() + 3600000);
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mechatronics FUT Minna//Events//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + (p.id || icsStamp(start)) + "@mechatronics-fut.vercel.app", "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start), "DTEND:" + icsStamp(end), "SUMMARY:" + icsText(p.title)];
    if (p.venue) lines.push("LOCATION:" + icsText(p.venue));
    if (p.summary) lines.push("DESCRIPTION:" + icsText(p.summary));
    lines.push("END:VEVENT", "END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (String(p.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event") + ".ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ----- card ----- */
  var CAL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>';
  function cardHtml(p, href) {
    var isEvent = p.kind === "event";
    var cover = safeUrl(p.cover_url);
    var title = href ? '<a href="' + esc(href) + '">' + esc(p.title) + "</a>" : esc(p.title);
    var chip = isEvent && p.event_start ? '<div class="post__date" aria-hidden="true"><span>' + esc(fmt(p.event_start, { day: "numeric" })) + "</span><small>" + esc(fmt(p.event_start, { month: "short" })) + "</small></div>" : "";
    var meta = isEvent
      ? '<p class="post__meta">' + esc(whenText(p)) + (p.venue ? " &middot; " + esc(p.venue) : "") + "</p>"
      : '<p class="post__meta">' + esc(dateLong(p.publish_at)) + "</p>";
    var actions = "";
    if (isEvent && p.event_start) actions += '<button type="button" class="btn btn--secondary btn--sm" data-ics="' + esc(p.id || "") + '">' + CAL + " Add to calendar</button>";
    if (safeUrl(p.link)) actions += '<a class="btn btn--sm" href="' + esc(safeUrl(p.link)) + '" target="_blank" rel="noopener noreferrer">' + (isEvent ? "Register or learn more" : "Read more") + "</a>";
    return '<article class="post post--' + (isEvent ? "event" : "news") + '">' +
      (cover ? '<div class="post__media"><img src="' + esc(cover) + '" alt="" loading="lazy" decoding="async"></div>' : "") +
      '<div class="post__body">' + '<p class="post__kind">' + (isEvent ? "Event" : "News") + "</p>" +
      '<div class="post__top">' + chip + "<div>" + meta + "<h3>" + title + "</h3></div></div>" +
      (p.summary ? "<p>" + esc(p.summary) + "</p>" : "") +
      (actions ? '<div class="post__actions">' + actions + "</div>" : "") + "</div></article>";
  }

  window.PostsUI = { esc: esc, safeUrl: safeUrl, dateLong: dateLong, timeOnly: timeOnly, whenText: whenText, paragraphs: paragraphs, downloadIcs: downloadIcs, cardHtml: cardHtml };
})();
