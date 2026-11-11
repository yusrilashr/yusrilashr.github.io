/* Hallmark · Cobalt · portfolio filter, skills-to-work links, nav position, contact plumbing.
 * No framework, no dependencies. Without this file the page is complete: every piece
 * shows, the filter bar stays hidden, and the email reads in its obfuscated form.
 */
(function () {
  "use strict";

  /* The data path, in order. A portfolio piece declares the stages it covers in
   * data-stages; the Skills section declares one stage per column in data-stage.
   * Both sides are matched here, so adding a piece is the only edit ever needed. */
  var STAGES = [
    ["database",      "Database"],
    ["pipeline",      "Pipeline"],
    ["processing",    "Processing"],
    ["visualisation", "Visualisation"],
    ["analysis",      "Analysis"]
  ];

  var grid    = document.getElementById("pieces");
  var toolbar = document.getElementById("toolbar");
  var bar     = document.getElementById("filters");
  var countEl = document.getElementById("pieces-count");
  var pieces  = grid ? Array.prototype.slice.call(grid.querySelectorAll(".piece")) : [];

  function stagesOf(el) {
    return (el.getAttribute("data-stages") || "").toLowerCase().split(/\s+/).filter(Boolean);
  }

  var counts = {};
  pieces.forEach(function (piece) {
    stagesOf(piece).forEach(function (stage) { counts[stage] = (counts[stage] || 0) + 1; });
  });

  var buttons = [];   // { stage: "" | key, el: <button> }

  /* --- 1. Portfolio filter ---------------------------------------------- */

  function apply(stage) {
    var shown = 0;

    pieces.forEach(function (piece) {
      var match = !stage || stagesOf(piece).indexOf(stage) !== -1;
      piece.hidden = !match;
      if (match) shown++;
    });

    buttons.forEach(function (b) {
      b.el.setAttribute("aria-pressed", b.stage === stage ? "true" : "false");
    });

    if (countEl) {
      countEl.textContent = stage
        ? "Showing " + shown + " of " + pieces.length
        : pieces.length + (pieces.length === 1 ? " piece" : " pieces");
    }

    // Restart the fade so it plays on every change, not only the first.
    grid.classList.remove("is-filtering");
    void grid.offsetWidth;
    grid.classList.add("is-filtering");
  }

  function addFilter(stage, label, n) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "filter";
    el.setAttribute("aria-pressed", "false");

    el.appendChild(document.createTextNode(label + " "));
    var num = document.createElement("span");
    num.className = "filter__n";
    num.textContent = String(n);
    el.appendChild(num);

    el.addEventListener("click", function () { apply(stage); });
    bar.appendChild(el);
    buttons.push({ stage: stage, el: el });
  }

  var present = STAGES.filter(function (s) { return counts[s[0]]; });

  // A filter with one option is not a filter — only show the bar when it can narrow something.
  if (grid && toolbar && bar && present.length > 1) {
    addFilter("", "All", pieces.length);
    present.forEach(function (s) { addFilter(s[0], s[1], counts[s[0]]); });
    toolbar.hidden = false;
    apply("");
    grid.classList.remove("is-filtering");   // no fade on first paint
  }

  /* --- 2. Skills → the work that shows them ----------------------------- */

  var work = document.getElementById("work");

  Array.prototype.slice.call(document.querySelectorAll(".flow__stage[data-stage]")).forEach(function (col) {
    var stage = col.getAttribute("data-stage");
    var n = counts[stage];
    if (!n || !buttons.length) return;   // nothing published for this stage yet — no link, no gap

    var link = document.createElement("button");
    link.type = "button";
    link.className = "flow__proof";
    link.textContent = n + (n === 1 ? " piece" : " pieces") + " in the portfolio";

    link.addEventListener("click", function () {
      apply(stage);
      if (work) work.scrollIntoView();
      var pressed = buttons.filter(function (b) { return b.stage === stage; })[0];
      if (pressed) pressed.el.focus({ preventScroll: true });
    });

    col.appendChild(link);
  });

  /* --- 3. Nav · mark the section in view -------------------------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var targets = links.map(function (a) {
    return { link: a, section: document.getElementById(a.getAttribute("href").slice(1)) };
  }).filter(function (t) { return t.section; });

  var ticking = false;

  /* The current section is the last one whose top has passed a line 30% down
   * the viewport. Measured on scroll rather than observed, because the short
   * last section can never reach that line: at the very bottom of the page it
   * is simply the current one. */
  function markCurrent() {
    ticking = false;
    var line = window.innerHeight * 0.3;
    var current = null;

    targets.forEach(function (t) {
      if (t.section.getBoundingClientRect().top <= line) current = t;
    });

    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && targets.length) current = targets[targets.length - 1];

    targets.forEach(function (t) {
      if (t === current) t.link.setAttribute("aria-current", "true");
      else t.link.removeAttribute("aria-current");
    });
  }

  function requestMark() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(markCurrent);
  }

  if (targets.length) {
    window.addEventListener("scroll", requestMark, { passive: true });
    window.addEventListener("resize", requestMark);
    markCurrent();
  }

  /* --- 4. Email · assembled client-side so scrapers mostly miss it ------ */

  var emailLink = document.getElementById("email-link");
  var emailText = document.getElementById("email-text");

  if (emailLink && emailText) {
    var address = emailLink.dataset.user + "@" + emailLink.dataset.domain;
    emailLink.href = "mailto:" + address;
    emailText.textContent = address;
  }

  /* --- Footer year ------------------------------------------------------ */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
