/* ==========================================================================
   components.js  -  builds the header, full-screen menu and footer from
   window.SITE (js/site-config.js). Plain JS, no dependencies.

   Every page needs:
     <div id="site-header"></div>   (first thing inside <body>)
     <main id="main"> ... </main>
     <div id="site-footer"></div>   (last thing inside <body>)
   and, in <head> or at the end of <body>, in this order:
     <script src="/js/site-config.js"></script>
     <script src="/js/components.js" defer></script>
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE;
  if (!S) { console.error("components.js: window.SITE is missing. Load site-config.js first."); return; }

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function norm(p) {
    p = p.split("#")[0].split("?")[0].replace(/index\.html$/, "").replace(/\.html$/, "");
    if (p.length > 1) p = p.replace(/\/$/, "");
    return p || "/";
  }
  var here = norm(location.pathname);
  function current(href) { return norm(href) === here ? ' aria-current="page"' : ""; }
  function live(list) { return (list || []).filter(function (x) { return x.live !== false; }); }

  /* Inline icons (no icon font, no network request) */
  var ICONS = {
    facebook: '<path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.5V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V8.7c0-.5.2-.7.5-.7z"/>',
    x: '<path d="M4 4l16 16M20 4l-6.5 7.2M4 20l6.5-7.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="6.6" y="10" width="2.2" height="7" rx=".3"/><circle cx="7.7" cy="7.4" r="1.3"/><path d="M11 10h2.1v1c.4-.7 1.2-1.2 2.3-1.2 2 0 2.6 1.3 2.6 3.2V17h-2.2v-3.4c0-.9-.2-1.5-1.1-1.5-1 0-1.5.7-1.5 1.6V17H11z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1"/>'
  };
  function socials() {
    return '<div class="socials">' + (S.socials || []).map(function (s) {
      return '<a href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(s.label) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[s.icon] || "") + "</svg></a>";
    }).join("") + "</div>";
  }

  var short = S.short || "FUT Minna";
  var mailtoReport = "mailto:" + esc(S.email) + "?subject=" + encodeURIComponent("Website correction: " + (document.title || "")) ;

  /* ---------- header ---------- */
  function buildHeader() {
    var el = document.createElement("header");
    el.className = "site-header";
    el.setAttribute("data-scrolled", "false");
    var items = (S.nav || []).filter(function (n) { return !n.home; });
    el.innerHTML =
      '<div class="container site-header__inner">' +
        '<a class="brand" href="/" aria-label="' + esc(S.name) + ', ' + esc(short) + ' - home">' +
          '<img src="/images/logo-sm.webp" alt="" width="57" height="38" decoding="async">' +
          '<span class="brand__text"><span class="brand__name">' + esc(S.name) + '</span><span class="brand__sub">' + esc(short) + "</span></span>" +
        "</a>" +
        '<nav class="primary-nav" aria-label="Primary"><ul>' +
          items.map(function (n) { return '<li><a href="' + esc(n.href) + '"' + current(n.href) + ">" + esc(n.label) + "</a></li>"; }).join("") +
        "</ul></nav>" +
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Open menu">' +
          '<span class="menu-toggle__bars" aria-hidden="true"></span>' +
        "</button>" +
      "</div>";
    return el;
  }

  /* ---------- full-screen menu ---------- */
  function buildMenu() {
    var i = 0;
    var el = document.createElement("div");
    el.className = "menu";
    el.id = "site-menu";
    var more = live(S.more);
    el.innerHTML =
      '<div class="container menu__inner">' +
        '<nav aria-label="Main menu"><ul class="menu__primary">' +
          (S.nav || []).map(function (n) {
            return '<li style="--i:' + (i++) + '"><a href="' + esc(n.href) + '"' + current(n.href) + ">" + esc(n.label) + "</a></li>";
          }).join("") +
        "</ul></nav>" +
        '<div class="menu__side">' +
          (more.length ?
            '<nav class="menu__more" aria-labelledby="menu-more-h"><p class="menu__heading" id="menu-more-h">More</p><ul>' +
              more.map(function (n) {
                return '<li style="--i:' + (i++) + '"><a href="' + esc(n.href) + '"' + current(n.href) + ">" + esc(n.label) + "</a></li>";
              }).join("") +
            "</ul></nav>" : "") +
          '<div class="menu__contact"><p class="menu__heading">Contact</p>' +
            '<p><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></p>" +
            (S.phone ? '<p><a href="tel:' + esc(S.phone.replace(/\s+/g, "")) + '">' + esc(S.phone) + "</a></p>" : "") +
          "</div>" +
        "</div>" +
        '<div class="menu__foot">' + socials() +
          "<small>" + esc(S.institution) + "</small></div>" +
      "</div>";
    return el;
  }

  /* ---------- footer ---------- */
  function buildFooter() {
    var el = document.createElement("footer");
    el.className = "site-footer";
    var more = live(S.more);
    var legal = live(S.legal);
    el.innerHTML =
      '<div class="container">' +
        '<div class="site-footer__grid">' +
          '<div class="site-footer__brand">' +
            '<img src="/images/logo.webp" alt="" width="72" height="48" loading="lazy" decoding="async">' +
            '<p class="site-footer__tagline">' + esc(S.tagline) + "</p>" +
            "<p>" + esc(S.name) + ", " + esc(S.institution) + ".</p>" +
          "</div>" +
          '<nav aria-labelledby="f-explore"><h2 id="f-explore">Explore</h2><ul>' +
            (S.nav || []).map(function (n) { return '<li><a href="' + esc(n.href) + '"' + current(n.href) + ">" + esc(n.label) + "</a></li>"; }).join("") +
          "</ul></nav>" +
          '<nav aria-labelledby="f-info"><h2 id="f-info">Information</h2><ul>' +
            more.map(function (n) { return '<li><a href="' + esc(n.href) + '"' + current(n.href) + ">" + esc(n.label) + "</a></li>"; }).join("") +
            '<li><a href="' + mailtoReport + '">Report an error or suggest an update</a></li>' +
          "</ul></nav>" +
          '<div><h2>Contact</h2><address>' +
            "<span>" + esc(S.address) + "</span>" +
            '<a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a>" +
            (S.phone ? '<a href="tel:' + esc(S.phone.replace(/\s+/g, "")) + '">' + esc(S.phone) + "</a>" : "") +
          "</address>" + socials() + "</div>" +
        "</div>" +
        '<div class="site-footer__bottom">' +
          "<span>&copy; " + new Date().getFullYear() + " " + esc(S.name) + ", " + esc(short) + ". Maintained by " + esc(S.maintainedBy) + ".</span>" +
          (legal.length ? "<span>" + legal.map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.label) + "</a>"; }).join(" &middot; ") + "</span>" : "") +
        "</div>" +
      "</div>";
    return el;
  }

  /* ---------- mount ---------- */
  function mount() {
    var hostH = document.getElementById("site-header");
    var hostF = document.getElementById("site-footer");
    var header = buildHeader();
    var menu = buildMenu();
    var footer = buildFooter();

    if (hostH) hostH.replaceWith(header, menu); else document.body.prepend(header, menu);
    if (hostF) hostF.replaceWith(footer); else document.body.append(footer);

    if (!document.querySelector(".skip-link")) {
      var skip = document.createElement("a");
      skip.className = "skip-link"; skip.href = "#main"; skip.textContent = "Skip to main content";
      document.body.prepend(skip);
    }

    /* header gets a glass background after scrolling */
    function onScroll() { header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false"); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* menu behaviour */
    var root = document.documentElement;
    var toggle = header.querySelector(".menu-toggle");
    var isOpen = false;

    function setBackgroundInert(on) {
      document.querySelectorAll("main, .site-footer, .skip-link").forEach(function (n) {
        if (on) n.setAttribute("inert", ""); else n.removeAttribute("inert");
      });
    }
    function open() {
      isOpen = true;
      root.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      setBackgroundInert(true);
      var first = menu.querySelector("a[href]");
      if (first) first.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      root.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      setBackgroundInert(false);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () { isOpen ? close(true) : open(); });

    menu.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (href.charAt(0) === "#" || norm(href) === here) close(false); /* same page: just close */
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      if (e.key !== "Tab") return;
      var f = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a[href]")));
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* the toggle is hidden from 960px up, so never leave the menu open there */
    var mq = window.matchMedia("(min-width: 960px)");
    var onMq = function (e) { if (e.matches) close(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
