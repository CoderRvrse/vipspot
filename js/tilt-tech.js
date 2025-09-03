(() => {
  // Respect motion preferences and coarse pointers (touch)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return;

  // Support multiple tilt zones: tech pills and pen cards
  const zones = [
    { root: document.querySelector('.tech-grid[data-tilt]'), itemSel: '.tech-pill', radius: 12 },
    { root: document.querySelector('.pens-grid[data-tilt]'), itemSel: '.tilt-card', radius: 14 } // Pens enabled
  ].filter(z => z.root);

  if (!zones.length) return;

  const MAX = 8;        // deg tilt
  const GLOW = 10;      // extra box-shadow radius

  function setVars(el, rx, ry, elev, glow, gx, gy, shineRot, shineO) {
    el.style.setProperty('--rx', rx + 'deg');
    el.style.setProperty('--ry', ry + 'deg');
    el.style.setProperty('--elev', elev + 'px');
    el.style.setProperty('--glow', glow + 'px');
    el.style.setProperty('--glow-x', gx + 'px');
    el.style.setProperty('--glow-y', gy + 'px');
    el.style.setProperty('--shine-rot', shineRot + 'rad');
    el.style.setProperty('--shine-o', String(shineO));
  }

  let raf = null, pending = null;
  
  function animate() {
    if (!pending) { raf = null; return; }
    const { el, x, y, w, h, cx, cy, elev } = pending;
    const nx = (x - cx) / (w / 2), ny = (y - cy) / (h / 2);
    const ry = -nx * MAX, rx = ny * MAX;
    const gx = nx * 12,  gy = ny * 12;
    const shineRot = Math.atan2(y - cy, x - cx);
    const shineO = Math.min(0.85, Math.hypot(nx, ny));
    setVars(el, rx, ry, elev, GLOW, gx, gy, shineRot, shineO);
    raf = requestAnimationFrame(animate);
  }

  zones.forEach(({ root, itemSel, radius }) => {
    root.addEventListener('pointermove', (e) => {
      const el = e.target.closest(itemSel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      pending = { el, x: e.clientX, y: e.clientY, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2, elev: radius };
      if (!raf) raf = requestAnimationFrame(animate);
    }, { passive: true });

    root.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf); raf = null; pending = null;
      root.querySelectorAll(itemSel).forEach((el) => {
        ['--rx','--ry','--elev','--glow','--glow-x','--glow-y','--shine-rot','--shine-o']
        .forEach(v => el.style.removeProperty(v));
      });
    });

    // keyboard discoverability
    root.addEventListener('focusin', (e) => {
      const el = e.target.closest(itemSel); if (!el) return;
      setVars(el, 0, 0, radius, GLOW, 0, 0, 0, .6);
    });
    root.addEventListener('focusout', (e) => {
      const el = e.target.closest(itemSel); if (!el) return;
      ['--rx','--ry','--elev','--glow','--glow-x','--glow-y','--shine-rot','--shine-o']
      .forEach(v => el.style.removeProperty(v));
    });
  });
})();