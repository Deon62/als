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

  /* --- The year ---------------------------------------------------------- */

  var years = document.querySelectorAll("[data-year]");
  var now = String(new Date().getFullYear());

  Array.prototype.forEach.call(years, function (node) {
    node.textContent = now;
  });
})();
