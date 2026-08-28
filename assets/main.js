/**
 * The only script on the site.
 *
 * The section-at-a-time scrolling is pure CSS, deliberately, so it works
 * before this file has loaded and keeps working if it fails to. What is left
 * here is the two things CSS cannot do on its own.
 */

(function () {
  "use strict";

  /* --- One question open at a time ---------------------------------------
   *
   * <details> has no group behaviour in browsers that predate the `name`
   * attribute, and `name` is still too new to rely on. Closing the siblings
   * by hand covers every browser and costs four lines.
   *
   * Scoped per .faq block, so a page with two separate lists does not have
   * one list closing the other's answers.
   */

  var lists = document.querySelectorAll(".faq");

  Array.prototype.forEach.call(lists, function (list) {
    var items = list.querySelectorAll(".faq__item");

    Array.prototype.forEach.call(items, function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;

        Array.prototype.forEach.call(items, function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* --- The contact form --------------------------------------------------
   *
   * The form already works without this. It has a real `action` and a real
   * `method`, so a submit with the script blocked posts to Formspree and the
   * reader lands on Formspree's own thank-you page, which is a worse ending
   * but not a broken one.
   *
   * What this adds is the part markup cannot: posting in the background so
   * nobody leaves the page they were reading, and saying what happened in a
   * line under the button. `aria-live` is on that line in the markup, so a
   * screen reader hears the outcome without the focus being moved.
   */

  var forms = document.querySelectorAll("[data-ask]");

  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector("[data-ask-status]");
    var button = form.querySelector("button[type='submit']");
    var label = button ? button.textContent : "";

    function say(text, state) {
      if (!status) return;
      status.textContent = text;
      status.className = "ask__status" + (state ? " ask__status--" + state : "");
    }

    /* No fetch means an old browser, and an old browser is better served by
       the plain submit it would have got anyway. */
    if (!window.fetch) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (button) {
        button.disabled = true;
        button.textContent = "Sending";
      }
      say("");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error(String(response.status));
          form.reset();
          say("Sent. We reply from a real inbox, usually within a day.", "ok");
        })
        .catch(function () {
          say("That did not send. Please use one of the addresses below.", "bad");
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.textContent = label;
          }
        });
    });
  });

  /* --- The year ---------------------------------------------------------- */

  var years = document.querySelectorAll("[data-year]");
  var now = String(new Date().getFullYear());

  Array.prototype.forEach.call(years, function (node) {
    node.textContent = now;
  });
})();
