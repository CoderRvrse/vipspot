(() => {
  // Respect motion preferences and coarse pointers (touch)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return;

  const grid = document.querySelector('.tech-grid[data-tilt]');
  if (!grid) return;

  const MAX = 8;        // deg tilt
  const Z = 14;         // px elevation
  const GLOW = 10;      // extra box-shadow radius

  let raf = null;
  let pending = null;

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

  function animate() {
    if (!pending) { raf = null; return; }
    const { el, x, y, w, h, cx, cy } = pending;
    // Normalize -1..1
    const nx = (x - cx) / (w / 2);
    const ny = (y - cy) / (h / 2);
    // Rotate opposite axis for natural feel
    const ry = -nx * MAX;
    const rx =  ny * MAX;
    // Glow tracks pointer a bit
    const gx = nx * 12, gy = ny * 12;
    // Shine angle
    const shineRot = Math.atan2(y - cy, x - cx);
    const shineO = Math.min(0.85, Math.hypot(nx, ny)); // brighter at edges

    setVars(el, rx, ry, Z, GLOW, gx, gy, shineRot, shineO);

    raf = requestAnimationFrame(animate);
  }

  function onMove(e) {
    const target = e.target.closest('.tech-pill');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    pending = {
      el: target,
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top  + rect.height / 2
    };
    if (!raf) raf = requestAnimationFrame(animate);
  }

  function reset(el) {
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.style.removeProperty('--elev');
    el.style.removeProperty('--glow');
    el.style.removeProperty('--glow-x');
    el.style.removeProperty('--glow-y');
    el.style.removeProperty('--shine-rot');
    el.style.removeProperty('--shine-o');
  }

  grid.addEventListener('pointermove', onMove, { passive: true });
  grid.addEventListener('pointerleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null; pending = null;
    grid.querySelectorAll('.tech-pill').forEach(reset);
  });

  // Keyboard: give a tiny pop + shine on focus for discoverability
  grid.addEventListener('focusin', (e) => {
    const el = e.target.closest('.tech-pill');
    if (!el) return;
    setVars(el, 0, 0, Z, GLOW, 0, 0, 0, .6);
    // allow CSS shine animation to play
  });
  grid.addEventListener('focusout', (e) => {
    const el = e.target.closest('.tech-pill');
    if (!el) return;
    reset(el);
  });
})();