/* partner.js - validates and sends the partner enquiry through Web3Forms */
(function () {
  "use strict";
  var S = window.SITE || {};
  var form = document.getElementById("partner-form");
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  function esc(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function busy(b, on) { b.classList.toggle("is-loading", on); b.setAttribute("aria-busy", on ? "true" : "false"); b.disabled = on; }

  function setErr(f, msg) {
    var el = $("p-" + f), box = $("e-" + f);
    box.textContent = msg || "";
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return !msg;
  }
  function validate() {
    var org = $("p-org").value.trim(), name = $("p-name").value.trim(), email = $("p-email").value.trim(), msg = $("p-message").value.trim();
    var ok = [
      setErr("org", org.length < 2 ? "Please enter your organisation." : ""),
      setErr("name", name.length < 2 ? "Please enter your name." : ""),
      setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid email address."),
      setErr("message", msg.length < 10 ? "Please write a little more (at least 10 characters)." : "")
    ];
    var ids = ["p-org", "p-name", "p-email", "p-message"];
    for (var i = 0; i < ok.length; i++) if (!ok[i]) { $(ids[i]).focus(); return false; }
    return true;
  }
  ["org", "name", "email", "message"].forEach(function (f) { $("p-" + f).addEventListener("input", function () { if (this.hasAttribute("aria-invalid")) setErr(f, ""); }); });

  function fail(text) {
    var mail = S.email ? ' You can also email <a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a> directly." : "";
    $("form-error").innerHTML = esc(text) + mail;
  }
  function showSent() { form.hidden = true; $("sent").hidden = false; $("sent").focus(); form.reset(); }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    $("form-error").textContent = "";
    if (!validate()) return;
    if (form.botcheck.checked) { showSent(); return; }
    if (!S.formKey || S.formKey.indexOf("YOUR_") === 0) { fail("The enquiry form is not switched on yet."); return; }
    var last = 0; try { last = Number(localStorage.getItem("mech_last_msg")) || 0; } catch (x) {}
    if (Date.now() - last < 30000) { fail("Please wait a moment before sending another message."); return; }

    var btn = $("send"); busy(btn, true);
    try {
      var org = $("p-org").value.trim(), interest = $("p-interest").value;
      var res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: S.formKey, from_name: "Mechatronics FUT website", subject: "[Partnership] " + interest + " - " + org,
          organisation: org, name: $("p-name").value.trim(), email: $("p-email").value.trim(), interest: interest, message: $("p-message").value.trim(), botcheck: ""
        })
      });
      var data = await res.json();
      if (!res.ok || !data.success) throw new Error("send failed");
      try { localStorage.setItem("mech_last_msg", String(Date.now())); } catch (x) {}
      showSent();
    } catch (err) {
      fail("Sorry, your enquiry could not be sent. Please check your connection and try again.");
    }
    busy(btn, false);
  });
  $("again").addEventListener("click", function () { $("sent").hidden = true; form.hidden = false; $("p-org").focus(); });
})();
