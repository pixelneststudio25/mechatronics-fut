/* contact.js - validates and sends the contact form through Web3Forms,
   and fills the contact details from js/site-config.js */
(function () {
  "use strict";
  var S = window.SITE || {};
  var form = document.getElementById("contact-form");
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function busy(b, on) { b.classList.toggle("is-loading", on); b.setAttribute("aria-busy", on ? "true" : "false"); b.disabled = on; }

  /* ----- contact details ----- */
  var d = '<h2>Department details</h2><dl style="display:grid;gap:var(--space-4);margin:0">';
  if (S.email) d += '<div class="detail"><dt>Email</dt><dd><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></dd></div>";
  if (S.phone) d += '<div class="detail"><dt>Phone</dt><dd><a href="tel:' + esc(S.phone.replace(/\s+/g, "")) + '">' + esc(S.phone) + "</a></dd></div>";
  if (S.address) d += '<div class="detail"><dt>Address</dt><dd>' + esc(S.address) + "</dd></div>";
  d += "</dl>";
  if (S.socials && S.socials.length) d += '<div><p class="detail"><span style="font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-faint)">Follow NAMTES</span></p><div class="links" style="margin-top:var(--space-2)">' +
    S.socials.map(function (s) { return '<a href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a>"; }).join("") + "</div></div>";
  $("details").innerHTML = d;

  /* ----- validation ----- */
  function setErr(field, msg) {
    var el = $("c-" + field), box = $("e-" + field);
    box.textContent = msg || "";
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return !msg;
  }
  function validate() {
    var ok = true, firstBad = null;
    var name = $("c-name").value.trim(), email = $("c-email").value.trim(), msg = $("c-message").value.trim();
    var r1 = setErr("name", name.length < 2 ? "Please enter your name." : "");
    var r2 = setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid email address.");
    var r3 = setErr("message", msg.length < 10 ? "Please write a little more (at least 10 characters)." : "");
    if (!r1) firstBad = $("c-name"); else if (!r2) firstBad = $("c-email"); else if (!r3) firstBad = $("c-message");
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  ["name", "email", "message"].forEach(function (f) { $("c-" + f).addEventListener("input", function () { if (this.hasAttribute("aria-invalid")) setErr(f, ""); }); });

  /* ----- send ----- */
  function fail(text) {
    var mail = S.email ? ' You can also email <a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a> directly." : "";
    $("form-error").innerHTML = esc(text) + mail;
  }
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    $("form-error").textContent = "";
    if (!validate()) return;
    if (form.botcheck.checked) { showSent(); return; } /* a bot filled the trap: pretend it worked */
    if (!S.formKey || S.formKey.indexOf("YOUR_") === 0) { fail("The contact form is not switched on yet."); return; }
    var last = 0; try { last = Number(localStorage.getItem("mech_last_msg")) || 0; } catch (x) {}
    if (Date.now() - last < 30000) { fail("Please wait a moment before sending another message."); return; }

    var btn = $("send"); busy(btn, true);
    try {
      var topic = $("c-topic").value, name = $("c-name").value.trim();
      var res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: S.formKey, from_name: "Mechatronics FUT website", subject: "[Website] " + topic + " from " + name,
          name: name, email: $("c-email").value.trim(), role: $("c-role").value, topic: topic, message: $("c-message").value.trim(), botcheck: ""
        })
      });
      var data = await res.json();
      if (!res.ok || !data.success) throw new Error(data && data.message ? data.message : "send failed");
      try { localStorage.setItem("mech_last_msg", String(Date.now())); } catch (x) {}
      showSent();
    } catch (err) {
      fail("Sorry, your message could not be sent. Please check your connection and try again.");
    }
    busy(btn, false);
  });

  function showSent() {
    form.hidden = true; $("sent").hidden = false; $("sent").focus();
    form.reset();
  }
  $("again").addEventListener("click", function () { $("sent").hidden = true; form.hidden = false; $("c-name").focus(); });
})();
