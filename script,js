/* ==========================================================================
   FIELD NOTES — interactions
   Nav toggle, active-link highlighting, scroll reveal, card cursor glow,
   and a lightweight ambient plotted-function background.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initMobileNav();
  initActiveNavHighlight();
  initScrollReveal();
  initCardGlow();
  initAmbientCanvas();
});

/* ---- footer year ------------------------------------------------------- */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- mobile nav toggle -------------------------------------------------- */
function initMobileNav() {
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- highlight nav link for section in view ----------------------------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('main section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    map.set(id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ---- scroll reveal ------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
}

/* ---- project card cursor glow -------------------------------------------- */
function initCardGlow() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}

/* ---- ambient background: a faint plotted function drifting across a grid */
function initAmbientCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = Math.min(window.innerHeight, 900);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(143, 174, 134, 0.16)';
    ctx.lineWidth = 1;

    // a slowly drifting sine curve, evocative of a plotted function
    ctx.beginPath();
    const amplitude = height * 0.06;
    const baseline = height * 0.38;
    const step = 6;
    for (let x = 0; x <= width; x += step) {
      const y = baseline + Math.sin((x * 0.012) + t) * amplitude
                + Math.sin((x * 0.004) + t * 0.6) * amplitude * 0.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // faint secondary curve
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(185, 129, 79, 0.10)';
    const baseline2 = height * 0.56;
    for (let x = 0; x <= width; x += step) {
      const y = baseline2 + Math.cos((x * 0.009) - t * 0.8) * amplitude * 0.7;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (!prefersReducedMotion) {
      t += 0.0025;
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  draw();

  // position the canvas as a fixed atmospheric layer behind content
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    zIndex: '0',
    pointerEvents: 'none',
    opacity: '0.7'
  });
}
