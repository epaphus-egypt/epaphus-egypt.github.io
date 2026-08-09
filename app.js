/* ============================================================
   FIELD NOTES — behavior layer
   Mobile nav, scroll-spy, reveal-on-scroll, hover tilt,
   and a lightweight animated coordinate-grid hero background.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Mobile nav toggle ---------------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Scroll-spy nav highlighting ---------------- */
  var navLinkEls = document.querySelectorAll('.nav-link');
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));

  function updateActiveNav() {
    var scrollPos = window.scrollY + 120;
    var current = sections[0] ? sections[0].id : null;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinkEls.forEach(function (link) {
      var target = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', target === current);
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNav, 100), { passive: true });
  updateActiveNav();

  /* ---------------- Reveal-on-scroll ---------------- */
  var revealTargets = document.querySelectorAll('.scroll-fade, .card, .entry, .beyond-card');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- Card cursor-follow tilt ---------------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card, .beyond-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (y * -2.2) + 'deg) rotateY(' + (x * 2.2) + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------- Throttle helper ---------------- */
  function throttle(fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  /* ---------------- Hero canvas: drifting coordinate grid + curve ---------------- */
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var wrap = canvas.parentElement;
  var w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = wrap.clientWidth;
    h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', throttle(resize, 200));

  var styles = getComputedStyle(document.documentElement);
  var mossBright = styles.getPropertyValue('--moss-bright').trim() || '#7fa07f';
  var copperBright = styles.getPropertyValue('--copper-bright').trim() || '#c98e64';
  var sage = styles.getPropertyValue('--sage').trim() || '#a9b8a1';

  var nodes = [];
  var nodeCount = 26;

  function seedNodes() {
    nodes = [];
    for (var i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.4 + 0.6
      });
    }
  }
  seedNodes();
  window.addEventListener('resize', throttle(seedNodes, 400));

  var t = 0;
  var maxDist = 160;

  function drawCurve() {
    // a soft sine curve drifting across the hero, evoking a plotted function
    ctx.beginPath();
    ctx.strokeStyle = mossBright;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.2;
    var amp = h * 0.09;
    var baseY = h * 0.62;
    for (var x = 0; x <= w; x += 6) {
      var y = baseY + Math.sin(x * 0.01 + t * 0.4) * amp + Math.sin(x * 0.003 - t * 0.15) * amp * 0.5;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawNodes() {
    ctx.globalAlpha = 0.5;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var dx = n.x - m.x, dy = n.y - m.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = sage;
          ctx.globalAlpha = (1 - dist / maxDist) * 0.18;
          ctx.lineWidth = 0.6;
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 0.7;
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.beginPath();
      ctx.fillStyle = k % 5 === 0 ? copperBright : mossBright;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    drawCurve();
    drawNodes();
    t += 0.015;
    requestAnimationFrame(frame);
  }

  if (!reduceMotion) {
    requestAnimationFrame(frame);
  } else {
    ctx.clearRect(0, 0, w, h);
    drawCurve();
    drawNodes();
  }
})();
