/* RN Media site behaviour. No libraries, no dependencies. */
(function () {
  'use strict';

  /* ── navbar background on scroll ── */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var onScroll = function () { navbar.classList.toggle('scrolled', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── mobile drawer ── */
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('side-drawer');
  var overlay   = document.getElementById('drawer-overlay');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (hamburger && drawer && overlay) {
    hamburger.addEventListener('click', function () {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    Array.prototype.forEach.call(
      document.querySelectorAll('.drawer-close-trigger'),
      function (el) { el.addEventListener('click', closeDrawer); }
    );
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ── scroll reveal ── */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { obs.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('visible'); });
  }

  /* ── hero: one scroll-driven sequence ──────────────────────
     Reads scroll position once per frame and writes progress vars onto
     .hero-pin. All of the hero's motion is derived from those vars, so
     the sequence stays a single timeline: camera on the cube, letters
     in one at a time, the dot, then the logo hands over to the copy. */
  var stage = document.querySelector('.hero-stage');
  var pin   = document.querySelector('.hero-pin');
  var copy  = document.querySelector('.hero-copy');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stage && pin && copy && !still) {

    /* [start, end] as a fraction of the stage's scrollable length */
    var T = {
      zoom: [0.02, 0.30],   /* camera pulls back from the cube to the lockup */
      m:    [0.28, 0.41],
      e:    [0.32, 0.45],
      d:    [0.36, 0.49],
      i:    [0.40, 0.53],
      a:    [0.44, 0.57],
      dot:  [0.56, 0.645], /* then the finished lockup holds until 0.75 */
      exit: [0.75, 0.88],   /* logo lifts and fades out */
      copy: [0.78, 0.88],   /* plus COPY_STAGGER per line; last line lands at 0.99 */
      hint: [0.02, 0.10]
    };
    var COPY_STAGGER = 0.028;

    /* geometry: the cube's centre sits left of and above the lockup's
       centre, so zooming in on it means offsetting the whole lockup by
       that gap, multiplied by the zoom. Both are % of the logo's box. */
    var ZOOM = 2.4, CUBE_CX = 32.525, CUBE_CY = 6.011;
    var EXIT_RISE = 22, EXIT_SHRINK = 0.16;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function span(p, r) { return clamp((p - r[0]) / (r[1] - r[0])); }
    function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function outBack(t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    function set(k, v) { pin.style.setProperty(k, v); }

    var queued = null;

    function render() {
      queued = null;
      var track = stage.offsetHeight - window.innerHeight;
      var p = track > 0 ? clamp(-stage.getBoundingClientRect().top / track) : 1;

      var z    = outCubic(span(p, T.zoom));
      var out  = outCubic(span(p, T.exit));
      var dotT = span(p, T.dot);

      set('--logo-x', (CUBE_CX * ZOOM * (1 - z)).toFixed(3) + '%');
      set('--logo-y', (CUBE_CY * ZOOM * (1 - z) - EXIT_RISE * out).toFixed(3) + '%');
      set('--logo-s', ((1 + (ZOOM - 1) * (1 - z)) * (1 - EXIT_SHRINK * out)).toFixed(4));
      set('--logo-o', (1 - out).toFixed(4));

      set('--t-m', outCubic(span(p, T.m)).toFixed(4));
      set('--t-e', outCubic(span(p, T.e)).toFixed(4));
      set('--t-d', outCubic(span(p, T.d)).toFixed(4));
      set('--t-i', outCubic(span(p, T.i)).toFixed(4));
      set('--t-a', outCubic(span(p, T.a)).toFixed(4));

      set('--t-dot', clamp(dotT * 2.2).toFixed(4));
      set('--s-dot', (0.3 + 0.7 * outBack(dotT)).toFixed(4));

      for (var i = 0; i < 5; i++) {
        var off = i * COPY_STAGGER;
        set('--c' + (i + 1), outCubic(span(p, [T.copy[0] + off, T.copy[1] + off])).toFixed(4));
      }

      set('--t-hint', (1 - span(p, T.hint)).toFixed(4));
    }

    function schedule() { if (queued === null) queued = requestAnimationFrame(render); }

    /* The pinned screen has to hold the hero copy at its natural height.
       Where it cannot -- short screens, landscape phones -- pinning would
       clip the CTA, so the hero stays static there instead. Measured, not
       guessed at, and re-checked whenever the viewport changes. */
    var VARS = ['--logo-x','--logo-y','--logo-s','--logo-o','--t-m','--t-e','--t-d',
                '--t-i','--t-a','--t-dot','--s-dot','--c1','--c2','--c3','--c4',
                '--c5','--t-hint'];
    var PIN_PADDING = 144, SAFETY = 24;
    var running = null;

    function setMode() {
      var ok = window.innerHeight >= copy.offsetHeight + PIN_PADDING + SAFETY;
      if (ok === running) { if (ok) schedule(); return; }
      running = ok;
      document.documentElement.classList.toggle('js-hero', ok);
      if (ok) {
        render();
      } else {
        for (var i = 0; i < VARS.length; i++) pin.style.removeProperty(VARS[i]);
      }
    }

    window.addEventListener('scroll', function () { if (running) schedule(); }, { passive: true });
    window.addEventListener('resize', setMode);
    window.addEventListener('orientationchange', setMode);
    setMode();
  }

  /* ── contact form (Formspree) ── */
  var form = document.getElementById('contact-form');
  if (form) {
    var submit  = document.getElementById('contact-submit');
    var success = document.getElementById('form-success');
    var label   = submit ? submit.textContent : '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      submit.disabled = true;
      submit.textContent = 'Lähetetään';
      fetch('https://formspree.io/f/xeedvgln', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          Array.prototype.forEach.call(form.querySelectorAll('.form-group, .form-note'), function (g) { g.style.display = 'none'; });
          submit.style.display = 'none';
          success.style.display = 'flex';
        } else {
          submit.disabled = false;
          submit.textContent = label;
        }
      }).catch(function () {
        submit.disabled = false;
        submit.textContent = label;
      });
    });
  }

  /* ── hero background video: skipped on mobile, reduced motion or Save-Data ── */
  var video = document.querySelector('.hero-video');
  if (video && video.dataset.src) {
    var heavy = window.matchMedia('(max-width: 768px)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || (navigator.connection && navigator.connection.saveData);
    if (!heavy) {
      video.src = video.dataset.src;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
})();
