/* Hallmark · Cobalt · three motion primitives and one bit of contact plumbing.
 * No framework, no dependencies. Everything degrades to a readable page without it.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1. Section reveal · fade + 10px rise, once ------------------------
   * A reveal must never be able to strand content at opacity 0. IntersectionObserver
   * alone can: it only fires when an element *crosses* a threshold, so an element that
   * goes from below the viewport to above it in one jump — a #hash deep-link, a reload
   * where the browser restores scroll, a fast mobile flick — never gets a callback and
   * stays invisible forever. So the observer handles the normal case, and a cheap sweep
   * on scroll catches anything that is at or above the fold regardless of how it got there.
   */
  var pending = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var observer = null;

  function show(el) { el.classList.add("is-in"); }

  /* Reveal everything at or above the fold; drop it from the pending list. */
  function sweep() {
    if (!pending.length) return;
    for (var i = pending.length - 1; i >= 0; i--) {
      var el = pending[i];
      if (el.getBoundingClientRect().top < window.innerHeight) {
        show(el);
        if (observer) observer.unobserve(el);
        pending.splice(i, 1);
      }
    }
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    // Reduced motion (or no IO support): everything is simply already there.
    pending.forEach(show);
    pending.length = 0;
  } else {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);   // one orchestrated entrance, then it just is
        var i = pending.indexOf(entry.target);
        if (i >= 0) pending.splice(i, 1);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    pending.forEach(function (el) { observer.observe(el); });
    sweep();
    window.addEventListener("load", sweep);      // scroll restoration lands after parse
    window.addEventListener("hashchange", sweep);
  }

  /* --- 2. Nav frost-on-scroll (+ the reveal safety sweep) · rAF-throttled */
  var nav = document.getElementById("nav");
  var ticking = false;

  function onFrame() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    sweep();
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onFrame);
  }, { passive: true });

  onFrame();

  /* --- 3. Email · assembled client-side so scrapers mostly miss it ------ */
  var emailLink = document.getElementById("email-link");
  var emailText = document.getElementById("email-text");

  if (emailLink && emailText) {
    var address = emailLink.dataset.user + "@" + emailLink.dataset.domain;
    emailLink.href = "mailto:" + address;
    emailLink.setAttribute("aria-label", "Email " + address);
    emailText.textContent = "Email";
  }

  /* --- Footer year ------------------------------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
