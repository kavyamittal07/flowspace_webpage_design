/**
 * FlowSpace — script.js
 * Project 2: Responsive Web Layout · DecodeLabs Batch 2026
 *
 * Progressive enhancement only — the site works fully without JS.
 * JS adds: hamburger aria-expanded sync, scroll-reveal animations,
 * active nav link highlighting, and smooth header hide-on-scroll.
 */

'use strict';

/* ─── 1. HAMBURGER ↔ POPOVER ARIA SYNC ──────────────────── */
(function () {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  // Sync aria-expanded with popover open/close
  mobileNav.addEventListener('toggle', (e) => {
    hamburger.setAttribute('aria-expanded', e.newState === 'open');
  });

  // Close on Escape (Popover API handles this natively,
  // but we also reset aria-expanded just in case)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ─── 2. SCROLL-REVEAL ANIMATIONS ───────────────────────── */
(function () {
  // Graceful fallback if IntersectionObserver not supported
  if (!('IntersectionObserver' in window)) return;

  // Add the base class so CSS can start elements hidden
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .reveal.in-view {
      opacity: 1;
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    }
  `;
  document.head.appendChild(style);

  // Elements to animate
  const revealSelectors = [
    '.service-card',
    '.work-card',
    '.post-card',
    '.about-visual',
    '.stat',
    '.sidebar-widget',
  ];

  const elements = document.querySelectorAll(revealSelectors.join(', '));

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger children of the same parent
    const siblings = el.parentElement.querySelectorAll('.reveal');
    const idx = Array.from(siblings).indexOf(el);
    el.style.transitionDelay = `${idx * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ─── 3. ACTIVE NAV LINK (SCROLL SPY) ───────────────────── */
(function () {
  const navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  const sections = [];

  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) sections.push({ link, section });
  });

  if (!sections.length) return;

  const activeLinkStyle = document.createElement('style');
  activeLinkStyle.textContent = `
    .nav-desktop a.active-link {
      color: var(--accent) !important;
      font-weight: 600;
    }
  `;
  document.head.appendChild(activeLinkStyle);

  let ticking = false;

  function updateActiveLink() {
    const scrollY = window.scrollY + 120; // offset for sticky header
    let current = null;

    sections.forEach(({ section }) => {
      if (section.offsetTop <= scrollY) {
        current = section;
      }
    });

    sections.forEach(({ link, section }) => {
      link.classList.toggle('active-link', section === current);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateActiveLink);
      ticking = true;
    }
  }, { passive: true });

  updateActiveLink(); // run on load
})();


/* ─── 4. HEADER HIDE ON SCROLL DOWN, SHOW ON UP ─────────── */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Only on desktop (mobile menu would be jarring)
  const mq = window.matchMedia('(min-width: 768px)');
  if (!mq.matches) return;

  let lastY = 0;
  let ticking = false;

  const hideStyle = document.createElement('style');
  hideStyle.textContent = `
    .site-header {
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  background 0.35s;
    }
    .site-header.header-hidden {
      transform: translateY(-100%);
    }
  `;
  document.head.appendChild(hideStyle);

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY && y > 80) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ─── 5. CONTACT FORM VALIDATION ────────────────────────── */
(function () {
  const sendBtn = document.querySelector('.contact-form .btn-primary');
  if (!sendBtn) return;

  // Override the inline onclick with proper validation
  sendBtn.removeAttribute('onclick');

  sendBtn.addEventListener('click', () => {
    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');

    // Simple required check
    let valid = true;

    [name, email, message].forEach((field) => {
      if (!field) return;
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ff5c35';
        valid = false;
      }
    });

    // Basic email pattern
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#ff5c35';
      valid = false;
    }

    if (valid) {
      sendBtn.textContent = 'Sent ✓';
      sendBtn.disabled = true;
      sendBtn.style.background = 'var(--accent-2)';
    }
  });
})();


/* ─── 6. SMOOTH SCROLL POLYFILL FOR OLDER BROWSERS ──────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Move focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();


/* ─── 7. VIEWPORT SIZE INDICATOR (DEV HELPER) ───────────── */
(function () {
  // Only shows in development (remove for production)
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 12px;
    left: 12px;
    background: rgba(13,17,23,.85);
    color: #a5f3c5;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    z-index: 9999;
    pointer-events: none;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.1);
  `;
  document.body.appendChild(indicator);

  function updateSize() {
    const w = window.innerWidth;
    let label = 'xs (<480)';
    if (w >= 1280) label = 'xl (≥1280)';
    else if (w >= 1024) label = 'lg (≥1024)';
    else if (w >= 768) label = 'md (≥768)';
    else if (w >= 480) label = 'sm (≥480)';
    indicator.textContent = `${w}px · ${label}`;
  }

  window.addEventListener('resize', updateSize, { passive: true });
  updateSize();
})();