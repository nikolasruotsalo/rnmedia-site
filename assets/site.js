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
