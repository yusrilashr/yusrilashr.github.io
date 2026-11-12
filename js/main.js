/* Hallmark · Cobalt · portfolio filter, skills-to-work links, nav position, scroll pop-in,
 * the moving masthead ribbon, and contact plumbing.
 * No framework, no dependencies. Without this file the page is complete: every piece
 * shows, nothing is hidden waiting to animate, the ribbon is a still image, and the
 * email reads in its obfuscated form.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

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
  var pieces  = grid ? all(".piece", grid) : [];

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

  all(".flow__stage[data-stage]").forEach(function (col) {
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

  /* --- 3. Pop-in on scroll ----------------------------------------------
   * Each block fades and settles into place once, the first time it scrolls
   * into view. The classes are added here rather than written in the HTML, so
   * a new portfolio piece needs no extra markup and a page without this script
   * never hides anything.
   */
  var REVEAL = ".section__head, .toolbar, .piece, .flow__stage, .cv__group, .cv__row, .contact > li";
  var pending = [];
  var revealer = null;

  function show(el, delay) {
    if (delay) el.style.setProperty("--reveal-delay", delay + "ms");
    el.classList.add("is-in");
    if (revealer) revealer.unobserve(el);
    var i = pending.indexOf(el);
    if (i !== -1) pending.splice(i, 1);
  }

  function showAll() { pending.slice().forEach(function (el) { show(el, 0); }); }

  if (!reducedMotion && "IntersectionObserver" in window) {
    pending = all(REVEAL);

    // Whatever is already on screen (or above it) when the page opens is simply
    // there: both classes land in the same frame, so nothing animates.
    pending.slice().forEach(function (el) {
      el.classList.add("reveal");
      if (el.getBoundingClientRect().top < window.innerHeight) show(el, 0);
    });

    revealer = new IntersectionObserver(function (entries) {
      // Blocks arriving together (a row of pieces, the five stages) follow each
      // other by a beat instead of landing as one slab.
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target, Math.min(n, 4) * 70);
        n++;
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    pending.forEach(function (el) { revealer.observe(el); });

    window.addEventListener("beforeprint", showAll);
  }

  /* A block must never be left invisible. The observer only reports a block
   * that enters the viewport, so two cases are caught by hand on scroll:
   * anything a jump (a nav click, a restored scroll position) carried past
   * unseen, and anything still waiting when the page has no further to go. */
  function sweep(atBottom) {
    if (!pending.length) return;
    if (atBottom) { showAll(); return; }
    pending.slice().forEach(function (el) {
      if (!el.hidden && el.getBoundingClientRect().bottom < 0) show(el, 0);
    });
  }

  /* --- 4. Nav · mark the section in view -------------------------------- */

  var links = all(".nav__link");
  var targets = links.map(function (a) {
    return { link: a, section: document.getElementById(a.getAttribute("href").slice(1)) };
  }).filter(function (t) { return t.section; });

  var ticking = false;

  /* The current section is the last one whose top has passed a line 30% down
   * the viewport. Measured on scroll rather than observed, because the short
   * last section can never reach that line: at the very bottom of the page it
   * is simply the current one. */
  function onFrame() {
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

    sweep(atBottom);
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onFrame);
  }

  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  onFrame();

  /* --- 5. Masthead ribbon · a curtain in a light wind --------------------
   * The ribbon is 82 straight lines whose envelope draws a curve. Here the same
   * lines are redrawn on a canvas with their ends swaying: a slow fold travels
   * along each fan, further at the loose end than at the anchored one, and the
   * "wind" itself rises and falls.
   */
  var hero   = document.getElementById("top");
  var canvas = document.getElementById("ribbon");

  function startRibbon(art) {
    var ctx = canvas.getContext("2d");
    var wide = window.matchMedia("(min-width: 40rem)");
    var W = 0, H = 0, dpr = 1;
    var visible = true, raf = 0, last = 0;

    function resize() {
      var box = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(box.width));
      H = Math.max(1, Math.round(box.height));
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    function draw(ms) {
      var t = ms / 1000;
      var scale = H / art.height;                               // "auto 100%" — fit the height
      var offset = (W - art.width * scale) * (wide.matches ? 1 : 0.78);   // right-aligned; 78% on a phone

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offset, 0);

      var stroke = ctx.createLinearGradient(0, art.height, art.width, 0);
      art.stops.forEach(function (s) { stroke.addColorStop(s.at, s.color); });
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;

      var wind = 0.6 + 0.4 * Math.sin(t * 0.17);                // gusts: the whole motion swells and eases

      art.fans.forEach(function (fan, f) {
        var n = fan.length - 1 || 1;
        fan.forEach(function (line, i) {
          var u = i / n;
          var fold   = Math.sin(t * 0.7 - u * 3.6 + f * 1.4);   // the main billow, travelling along the fan
          var ripple = Math.sin(t * 0.43 - u * 6.8 + f * 0.7);  // a finer, slower one over it
          var lag    = Math.sin(t * 0.7 - u * 3.6 + f * 1.4 - 0.9);

          ctx.globalAlpha = line.o;
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1 + (fold * 10 + ripple * 4) * wind);                    // the anchored end
          ctx.lineTo(line.x2 + Math.cos(t * 0.41 - u * 2.4 + f) * 16 * wind,
                     line.y2 + (lag * 32 + ripple * 10) * wind);                              // the loose end
          ctx.stroke();
        });
      });

      // The artwork's own left-to-right fade, so the type side stays clear.
      var fade = ctx.createLinearGradient(0, 0, art.width, 0);
      fade.addColorStop(art.fade[0], "rgba(0, 0, 0, 0)");
      fade.addColorStop(art.fade[1], "rgba(0, 0, 0, 1)");
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, art.width, art.height);
      ctx.globalCompositeOperation = "source-over";
    }

    function loop(ms) {
      raf = 0;
      if (!visible) return;
      if (ms - last >= 32) { last = ms; draw(ms); }             // ~30 fps is plenty for motion this slow
      raf = window.requestAnimationFrame(loop);
    }

    function wake() { if (visible && !raf) raf = window.requestAnimationFrame(loop); }

    resize();
    draw(performance.now());
    hero.classList.add("is-live");                              // the still image steps aside

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () { resize(); draw(performance.now()); }).observe(hero);
    } else {
      window.addEventListener("resize", function () { resize(); draw(performance.now()); });
    }

    // Draw only while the masthead is on screen.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        wake();
      }).observe(hero);
    }
    wake();
  }

  /* The artwork, as numbers. These are the same 82 lines as assets/header-ribbon.svg
   * (which stays as the still fallback): each fan runs its lines between two rails,
   * `from` and `to`, and fades toward both edges. Kept here rather than fetched from
   * the SVG so the ribbon also moves when the page is opened straight from disk. */
  function fan(count, from, to, half) {
    var lines = [];
    for (var i = 0; i < count; i++) {
      var u = i / (count - 1);
      lines.push({
        x1: from[0] + (from[2] - from[0]) * u, y1: from[1] + (from[3] - from[1]) * u,
        x2: to[0]   + (to[2]   - to[0])   * u, y2: to[1]   + (to[3]   - to[1])   * u,
        o:  half[Math.min(i, count - 1 - i)]
      });
    }
    return lines;
  }

  if (hero && canvas && canvas.getContext && !reducedMotion) {
    var css = window.getComputedStyle(document.documentElement);
    var stops = [0, 0.5, 0.8, 1].map(function (at, i) {
      return { at: at, color: css.getPropertyValue("--ribbon-" + (i + 1)).trim() };
    });

    if (stops.every(function (s) { return s.color; })) {
      startRibbon({
        width: 1600,
        height: 480,
        fade: [0.30, 0.62],
        stops: stops,
        fans: [
          fan(47, [90, 564, 1263.3, -48], [2010, 84, 823.3, 552],
            [0.060, 0.104, 0.130, 0.150, 0.169, 0.186, 0.202, 0.217, 0.231, 0.245, 0.258, 0.271,
             0.283, 0.295, 0.306, 0.318, 0.329, 0.339, 0.350, 0.360, 0.370, 0.380, 0.390, 0.400]),
          fan(35, [340, 576, 1486.7, 48], [2046.7, 168, 1113.3, 564],
            [0.040, 0.067, 0.082, 0.095, 0.106, 0.117, 0.126, 0.135, 0.144,
             0.152, 0.160, 0.168, 0.176, 0.183, 0.190, 0.197, 0.203, 0.210])
        ]
      });
    }
  }

  /* --- 6. Email · assembled client-side so scrapers mostly miss it ------ */

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
