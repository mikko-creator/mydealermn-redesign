/* site.js - My Dealer redesign: header + mega menus, drawer, 21+ gate, reveals, sketch draw-on, parallax, tilt,
   marquee, hero film toggle (FOUNDATION). No dependencies. Contract D6: no string literal here starts with a slash;
   every URL is read from HTML attributes. All motion is off under prefers-reduced-motion. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* touch screens: no scroll parallax (mobile.css drops the transform; this skips the rAF work too) */
  var coarse = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var desktopMq = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: true, addEventListener: function () {} };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };
  var $ = function (sel, el) { return (el || doc).querySelector(sel); };
  root.classList.add('js');

  /* ---------------- header: scrolled state ---------------- */
  var header = $('[data-header]');
  function onScrollHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- mega menus: hover intent + click + keyboard ---------------- */
  var megas = $$('[data-mega]');
  var openItem = null;
  var openTimer = 0;
  var closeTimer = 0;
  function setOpen(item, open) {
    var btn = $('.nav__trigger', item);
    item.classList.toggle('is-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (openItem && openItem !== item) setOpen(openItem, false);
      openItem = item;
    } else if (openItem === item) {
      openItem = null;
    }
    if (header) header.classList.toggle('has-open-mega', !!openItem && desktopMq.matches);
  }
  function closeAll() { megas.forEach(function (m) { setOpen(m, false); }); }
  megas.forEach(function (item) {
    var btn = $('.nav__trigger', item);
    if (!btn) return;
    btn.addEventListener('click', function () {
      clearTimeout(openTimer); clearTimeout(closeTimer);
      setOpen(item, !item.classList.contains('is-open'));
    });
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      openTimer = setTimeout(function () { setOpen(item, true); }, openItem ? 0 : 90);
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { setOpen(item, false); }, 320);
    });
    item.addEventListener('focusout', function (e) {
      if (!desktopMq.matches) return;
      if (e.relatedTarget && item.contains(e.relatedTarget)) return;
      setTimeout(function () { if (!item.contains(doc.activeElement)) setOpen(item, false); }, 0);
    });
  });
  doc.addEventListener('click', function (e) {
    if (openItem && desktopMq.matches && !openItem.contains(e.target)) closeAll();
  });

  /* ---------------- drawer (below 1024px) ---------------- */
  var nav = $('[data-nav]');
  var toggle = $('[data-nav-toggle]');
  var scrim = $('[data-nav-scrim]');
  var closeBtn = $('[data-nav-close]');
  function setDrawer(open) {
    if (!nav || !toggle) return;
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    if (open) {
      var first = $('.nav__link', nav);
      if (first) setTimeout(function () { first.focus(); }, 60);
    } else {
      closeAll();
    }
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(!root.classList.contains('nav-open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); if (toggle) toggle.focus(); });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  desktopMq.addEventListener && desktopMq.addEventListener('change', function () { setDrawer(false); closeAll(); });

  /* Esc: close mega or drawer and return focus */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openItem) {
      var btn = $('.nav__trigger', openItem);
      setOpen(openItem, false);
      if (btn && desktopMq.matches) btn.focus();
      return;
    }
    if (root.classList.contains('nav-open')) { setDrawer(false); if (toggle) toggle.focus(); }
  });

  /* ---------------- 21+ gate (D7) ---------------- */
  var gate = $('[data-age-gate]');
  var KEY = 'mdl-age-ok';
  var ok = false;
  try { ok = window.localStorage.getItem(KEY) === '1'; } catch (err) { ok = false; }
  if (gate && !ok) {
    var lastFocus = doc.activeElement;
    gate.hidden = false;
    root.classList.add('gate-open');
    var yes = $('[data-age-yes]', gate);
    var no = $('[data-age-no]', gate);
    var msg = $('[data-age-msg]', gate);
    setTimeout(function () { if (yes) yes.focus(); }, 30);
    if (yes) yes.addEventListener('click', function () {
      try { window.localStorage.setItem(KEY, '1'); } catch (err) { /* private mode: the gate just closes */ }
      gate.hidden = true;
      root.classList.remove('gate-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    if (no) no.addEventListener('click', function () { if (msg) msg.hidden = false; });
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button, a[href]', gate).filter(function (x) { return !x.hidden && x.offsetParent !== null; });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }

  /* ---------------- reveals + sketch draw-on ---------------- */
  var reveals = $$('[data-reveal]');
  var draws = $$('[data-draw]');
  var hasIO = 'IntersectionObserver' in window;
  var ioAlive = false;
  if (reduce || !hasIO) {
    reveals.concat(draws).forEach(function (el) { el.classList.add('is-in'); });
    root.classList.add('reveal-all', 'io-dead');
  } else {
    var ioReveal = new IntersectionObserver(function (entries) {
      ioAlive = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ioReveal.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ioReveal.observe(el); });
    var ioDraw = new IntersectionObserver(function (entries) {
      ioAlive = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ioDraw.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    draws.forEach(function (el) { ioDraw.observe(el); });
    var vh = function () { return window.innerHeight || root.clientHeight; };
    var inView = function (el) { var r = el.getBoundingClientRect(); return (r.width || r.height) && r.bottom > 0 && r.top < vh(); };
    var startsAbove = function (el) { var r = el.getBoundingClientRect(); return (r.width || r.height) && r.top < vh(); };
    var mark = function (el) { el.classList.add('is-in'); ioReveal.unobserve(el); ioDraw.unobserve(el); };
    /* first screen: everything already in the viewport starts now, with no margin (the observers' bottom margins would
       leave a sketch sitting low in the first screen undrawn); two frames so the transition runs from the start state */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        reveals.concat(draws).forEach(function (el) { if (!el.classList.contains('is-in') && inView(el)) mark(el); });
      });
    });
    /* fail-safe at 2.5 s: every reveal is visible (html.reveal-all); every reveal and sketch at or above the viewport
       is finished; if the observers never answered (hidden tab, broken IO) everything is shown and drawn */
    setTimeout(function () {
      root.classList.add('reveal-all');
      reveals.concat(draws).forEach(function (el) { if (!ioAlive || startsAbove(el)) mark(el); });
      if (!ioAlive) root.classList.add('io-dead');
    }, 2500);
  }

  /* ---------------- parallax ([data-depth], rAF, transform only) ---------------- */
  var depthEls = (reduce || coarse) ? [] : $$('[data-depth]');
  if (depthEls.length) {
    var ticking = false;
    var vis = new Set();
    var ioDepth = hasIO ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) vis.add(en.target); else vis.delete(en.target); });
      queue();
    }, { rootMargin: '20% 0px 20% 0px' }) : null;
    depthEls.forEach(function (el) { if (ioDepth) ioDepth.observe(el); else vis.add(el); });
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      vis.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        var y = Math.max(-60, Math.min(60, -center * d));
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
    };
    var queue = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    queue();
  }

  /* ---------------- pointer tilt (fine pointers only) ---------------- */
  if (!reduce && finePointer) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- marquee: shift by one copy; pause off-screen ---------------- */
  $$('[data-marquee]').forEach(function (m) {
    var copies = parseInt(m.getAttribute('data-marquee'), 10);
    if (copies > 1) m.style.setProperty('--marquee-shift', (100 / copies).toFixed(4) + '%');
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { m.classList.toggle('is-paused', !en.isIntersecting); });
      }).observe(m);
    }
  });

  /* ---------------- ambient loops (video[data-ambient]): markup has no autoplay and preload="none", so a below-fold
     loop downloads nothing on first load; it starts (and loads) only when it comes within 200px of the viewport and
     pauses off-screen; poster only under reduced motion ---------------- */
  $$('video[data-ambient]').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    var start = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (!hasIO) { start(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { if (!v.paused) v.pause(); }
        else if (v.paused) start();
      });
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0 }).observe(v);
  });

  /* ---------------- hero film: pause/play button; paused under reduced motion and off-screen ---------------- */
  $$('[data-video-toggle]').forEach(function (btn) {
    var v = doc.getElementById(btn.getAttribute('aria-controls'));
    if (!v) return;
    var userPaused = false;
    var label = $('[data-label]', btn);
    function sync() {
      var playing = !v.paused;
      btn.setAttribute('aria-pressed', playing ? 'false' : 'true');
      btn.classList.toggle('is-paused', !playing);
      if (label) label.textContent = playing ? btn.getAttribute('data-label-pause') : btn.getAttribute('data-label-play');
    }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () { sync(); }); }
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); userPaused = true; }
    btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) { if (!v.paused) v.pause(); }
          else if (!userPaused && v.paused) play();
        });
      }, { threshold: 0.05 }).observe(v);
    }
    sync();
  });
})();
