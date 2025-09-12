/**
 * VIPSpot Back-to-Top Component
 * Neon progress ring + rocket launch animation + accessibility
 * Features: rAF throttling, reduced motion support, keyboard shortcuts
 */

(() => {
  const btn = document.getElementById('vipspot-top');
  if (!btn) return;

  // Progress ring geometry
  const ring = btn.querySelector('.progress');
  const R = 24;                // matches SVG r
  const CIRC = 2 * Math.PI * R;
  ring.style.strokeDasharray = String(CIRC);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show/hide threshold
  const SHOW_AT = 280;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY || window.pageYOffset;
      // Show logic
      if (y > SHOW_AT) btn.classList.add('show');
      else btn.classList.remove('show');

      // Progress 0..1
      const p = Math.min(1, Math.max(0, max > 0 ? y / max : 0));
      ring.style.strokeDashoffset = String(CIRC - p * CIRC);

      ticking = false;
    });
  };

  // Passive listener for performance
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const scrollToTop = () => {
    // Prefer existing header or fallback to body
    const target = document.querySelector('header') || document.getElementById('site-top') || document.body;
    if (prefersReduced) {
      // Instant for reduced motion
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Click → launch micro anim + smooth scroll
  btn.addEventListener('click', () => {
    btn.classList.add('launch');
    scrollToTop();
    setTimeout(() => btn.classList.remove('launch'), 600);
  });

  // Keyboard shortcut: T or Home
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    // Ignore typing inside inputs/textareas
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

    if (e.key === 'Home' || e.key.toLowerCase() === 't') {
      e.preventDefault();
      scrollToTop();
      // Focus the button for screen readers
      btn.focus();
    }
  }, { passive: false });

  // Subtle magnetic hover (GPU only, no layout thrash)
  let hoverRAF = 0;
  btn.addEventListener('mousemove', (e) => {
    if (prefersReduced) return;
    cancelAnimationFrame(hoverRAF);
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
    const dy = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
    hoverRAF = requestAnimationFrame(() => {
      btn.querySelector('.glyph').style.transform =
        `translate(${dx*2}px, ${dy*-2}px) scale(1.02)`;
    });
  });

  btn.addEventListener('mouseleave', () => {
    if (prefersReduced) return;
    btn.querySelector('.glyph').style.transform = '';
  });

  // Announce to screen readers when component becomes visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        btn.setAttribute('aria-hidden', 'false');
      } else {
        btn.setAttribute('aria-hidden', 'true');
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(btn);
})();