/* legal.js - fills the contact email on the privacy and accessibility pages from js/site-config.js */
(function () {
  "use strict";
  var S = window.SITE; if (!S || !S.email) return;
  Array.prototype.forEach.call(document.querySelectorAll("[data-site-email]"), function (a) {
    a.href = "mailto:" + S.email; a.textContent = S.email;
  });
})();
