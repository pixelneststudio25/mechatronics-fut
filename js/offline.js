/* offline.js - the "Try again" button on offline.html */
(function () {
  "use strict";
  var b = document.getElementById("retry");
  if (!b) return;
  b.addEventListener("click", function () {
    b.classList.add("is-loading"); b.disabled = true;
    setTimeout(function () { location.reload(); }, 300);
  });
})();
