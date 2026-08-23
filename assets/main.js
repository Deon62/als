/**
 * The only script on the site.
 *
 * The section-at-a-time scrolling is pure CSS — see `scroll-snap-type` in
 * styles.css — deliberately, so it works before this file has loaded and keeps
 * working if it fails to. What is left here is the two things CSS cannot do:
 * mark the nav link for the section you are actually looking at, and keep the
 * copyright year honest.
 */

(function () {
  "use strict";

  // --- Which section am I in? ---------------------------------------------

  var links = Array.prototype.slice.call(
    document.querySelectorAll(".nav__link[href^='#']")
  );

  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      byId[id] = link;
      sections.push(section);
    });

    var mark = function (id) {
      links.forEach(function (link) {
        if (link === byId[id]) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    // The threshold is high because sections are a full screen tall: at 0.5 a
    // section is "visible" while it is only half on screen, and two of them
    // would qualify at once during a scroll.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) mark(entry.target.id);
        });
      },
      { threshold: 0.55 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // --- Year ----------------------------------------------------------------

  var years = document.querySelectorAll("[data-year]");
  var now = String(new Date().getFullYear());
  Array.prototype.forEach.call(years, function (node) {
    node.textContent = now;
  });
})();
