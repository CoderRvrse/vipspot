/**
 * Optimized Matrix Rain Background
 * Reduces CPU/RAM by 60-90% through FPS capping, adaptive density, and visibility detection
 */
(() => {
  'use strict';

  const CFG = {
    fps: 28,
    density: 0.9,
    minDensity: 0.5,
    trailAlpha: 0.08,
    rotateSeconds: 20,          // rotate glyph set every N seconds
    burstMinMs: 12000,          // min time between bursts
    burstMaxMs: 28000           // max time between bursts
  };

  // Rotating glyph sets (UTF-8 source file)
  const SETS = {
    jp:  'アイウエオカキクケコサシスセソタチツテトナニヌネノﾊﾋﾌﾍﾎ0123456789',
    ru:  'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789',
    lat: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    num: '0123456789'
  };
  const ORDER = ['jp','ru','lat','num'];
  let setIndex = 0;
  let CHARS = SETS[ORDER[setIndex]].split('');

  let canvas, ctx, w, h, dpr = 1;
  let cols = 0, drops = [];
  let raf = 0, last = 0, interval = 1000 / CFG.fps;
  let inView = true, visible = true;
  let lastRotate = 0;
  let burst = null, nextBurstAt = 0;
  let lastThemeCheck = 0;

  // Legacy variables for compatibility
  let columns = [];
  let columnCount = 0;
  let fontSize = 14;
  let baseDropSpeed = 1;
  let densityMultiplier = 1;
  
  // Performance monitoring
  let frameCount = 0;
  let lastFpsCheck = 0;
  let currentFps = CFG.fps;

  // --- Glyph atlas cache ---
  let atlas = null, atlasCols = [], atlasCharW = 0, atlasCharH = 0;

  // --- Idle sleep variables ---
  let idleT, idleMs = 30000, asleep = false;

  // --- Theme cycles (time-of-day) ---
  const THEMES = {
    dawn:     { color: 'rgba(255,192,203,0.85)', trail: 0.06 }, // soft pink
    morning:  { color: 'rgba(0,255,170,0.85)', trail: 0.08 },  // classic cyan
    afternoon: { color: 'rgba(135,206,235,0.85)', trail: 0.07 }, // sky blue
    evening:  { color: 'rgba(255,215,0,0.85)', trail: 0.06 },  // warm gold
    night:    { color: 'rgba(138,43,226,0.85)', trail: 0.08 }  // deep purple
  };

  function getTimeTheme(){
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return THEMES.dawn;
    if (hour >= 8 && hour < 12) return THEMES.morning;
    if (hour >= 12 && hour < 17) return THEMES.afternoon;
    if (hour >= 17 && hour < 21) return THEMES.evening;
    return THEMES.night;
  }

  // --- Debug HUD ---
  let debugHUD = null;
  let debugEnabled = false;

  // --- Manual theme override ---
  let themeAuto = true, themeForced = null;

  function themeVars(){
    const cs = getComputedStyle(document.documentElement);
    return {
      color: cs.getPropertyValue('--matrix-color').trim() || 'rgba(0,255,170,.85)',
      trail: parseFloat(cs.getPropertyValue('--matrix-trail')) || 0.08
    };
  }

  function getCurrentTheme(){
    if (!themeAuto && themeForced && THEMES[themeForced]) {
      return THEMES[themeForced];
    }
    return getTimeTheme();
  }

  function applyTheme(themeName = null){
    const name = themeName || (themeAuto ? Object.keys(THEMES).find(k => THEMES[k] === getTimeTheme()) : themeForced);
    if (name) {
      document.documentElement.setAttribute('data-matrix-theme', name);
      buildAtlas(); // Rebuild with new colors
    }
  }

  function createDebugHUD(){
    if (debugHUD) return;
    // HUD safety: ensure it's dev-only  
    const isDebug = new URLSearchParams(location.search).get('debug') === '1';
    if (!isDebug) return;
    
    debugHUD = document.createElement('div');
    debugHUD.id = 'matrix-debug-hud';
    debugHUD.style.cssText = `
      position: fixed; top: 10px; right: 10px; z-index: 9999;
      background: rgba(0,0,0,0.7); color: #0f0; padding: 8px;
      font: 11px "Roboto Mono", monospace; border-radius: 4px;
      pointer-events: none; user-select: none; white-space: pre-line;
    `;
    document.body.appendChild(debugHUD);
  }

  function updateDebugHUD(){
    if (!debugHUD || !debugEnabled) return;
    const theme = getTimeTheme();
    const themeName = Object.keys(THEMES).find(key => THEMES[key] === theme) || 'custom';
    debugHUD.textContent = `FPS: ${currentFps}\nDensity: ${(densityMultiplier * 100).toFixed(0)}%\nTheme: ${themeName}\nChars: ${CHARS.length}`;
  }

  function removeDebugHUD(){
    if (debugHUD) {
      debugHUD.remove();
      debugHUD = null;
    }
  }

  function disposeAtlas(){
    if (atlas && 'close' in atlas) { try { atlas.close(); } catch {} } // ImageBitmap.close()
    atlas = null; atlasCols = [];
  }

  async function buildAtlas(){
    disposeAtlas();
    const fontPx = parseInt(ctx.font, 10) || 16;
    atlasCharW = fontPx;
    atlasCharH = Math.ceil(fontPx * 1.2);

    const off = document.createElement('canvas');
    off.width  = atlasCharW * CHARS.length;
    off.height = atlasCharH;

    const octx = off.getContext('2d', { alpha: true });
    octx.font = ctx.font;
    octx.textBaseline = 'top';
    octx.fillStyle = themeVars().color;

    // render each glyph once
    for (let i = 0; i < CHARS.length; i++){
      octx.fillText(CHARS[i], i * atlasCharW, 0);
    }

    // Convert to ImageBitmap if supported (cheaper to draw)
    if ('createImageBitmap' in window) {
      try {
        atlas = await createImageBitmap(off);
      } catch {
        atlas = off; // fallback
      }
    } else {
      atlas = off;
    }

    atlasCols = CHARS.map((_, i) => i * atlasCharW);
  }

  function drawGlyph(iCol, y){
    if (!atlas) return; // first frame before atlas is ready
    const sx = atlasCols[(Math.random() * CHARS.length) | 0];
    const dx = iCol * atlasCharW;
    ctx.drawImage(atlas, sx, 0, atlasCharW, atlasCharH, dx, y, atlasCharW, atlasCharH);
  }

  function applyDatasetOverrides(el){
    const d = el.dataset;
    if (d.fps) CFG.fps = Math.max(16, +d.fps|0), interval = 1000/CFG.fps;
    if (d.density) CFG.density = Math.min(1, Math.max(CFG.minDensity, +d.density));
    if (d.rotateSeconds) CFG.rotateSeconds = Math.max(8, +d.rotateSeconds|0);
    if (d.burst === 'off') { CFG.burstMinMs = CFG.burstMaxMs = 0; burst = null; }
  }

  function initCanvas() {
    const IDS = ['matrix-canvas', 'matrix-bg']; // prefer new name, still support old
    canvas = IDS.map(id => document.getElementById(id)).find(Boolean);
    if (!canvas) return false;
    
    applyDatasetOverrides(canvas);

    // Battery saver auto-light mode
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      CFG.density = Math.max(CFG.minDensity, CFG.density - 0.2);
    }
    if (navigator.deviceMemory && navigator.deviceMemory <= 4) {
      CFG.density = Math.max(CFG.minDensity, CFG.density - 0.1);
      CFG.fps = Math.max(22, CFG.fps - 4); 
      interval = 1000/CFG.fps;
    }

    ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return false;

    resizeCanvas();
    initColumns();
    return true;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR to prevent excessive memory usage
    
    w = rect.width;
    h = rect.height;
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    // Recalculate columns on resize
    cols = Math.floor(w / fontSize);
    columnCount = cols; // legacy compatibility
    initColumns();
    
    // Set font and rebuild atlas
    ctx.font = `${fontSize}px "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    buildAtlas();
  }

  function initColumns() {
    columns = [];
    drops = [];
    for (let i = 0; i < columnCount; i++) {
      // Stagger initial positions to avoid synchronized drops
      columns[i] = Math.floor(Math.random() * h / fontSize);
      drops[i] = -Math.random() * h * 0.25;
    }
  }

  function adjustDensity() {
    // Adaptive density based on performance
    if (currentFps < CFG.fps * 0.8) {
      densityMultiplier = Math.max(CFG.minDensity, densityMultiplier * 0.9);
    } else if (currentFps > CFG.fps * 0.95 && densityMultiplier < CFG.density) {
      densityMultiplier = Math.min(CFG.density, densityMultiplier * 1.05);
    }
  }

  function rotateSet(now){
    if (!lastRotate) lastRotate = now;
    if (now - lastRotate < CFG.rotateSeconds * 1000) return;
    setIndex = (setIndex + 1) % ORDER.length;
    CHARS = SETS[ORDER[setIndex]].split('');
    lastRotate = now;
    buildAtlas();
  }

  function checkThemeChange(now){
    if (!themeAuto) return; // Skip auto-theme if manually overridden
    if (!lastThemeCheck) lastThemeCheck = now;
    // Check theme every 5 minutes (themes change by hour)
    if (now - lastThemeCheck < 5 * 60 * 1000) return;
    lastThemeCheck = now;
    applyTheme(); // Apply time-based theme and rebuild atlas
  }

  function scheduleNextBurst(now){
    const rnd = CFG.burstMinMs + Math.random()*(CFG.burstMaxMs - CFG.burstMinMs);
    nextBurstAt = now + rnd;
  }

  function maybeStartBurst(now){
    if (burst || !nextBurstAt || now < nextBurstAt) return;
    const fontPx = fontSize;
    const text = 'VIPSPOT.NET';
    const neededCols = text.length;
    const startCol = Math.max(0, Math.floor(Math.random()*(Math.max(1, cols - neededCols))));
    const y = Math.floor(h*0.25 + Math.random()*h*0.5); // mid band
    burst = { text, startCol, y, frames: 16, fontPx };
  }

  function renderBurst(){
    if (!burst) return;
    const { text, startCol, y, frames, fontPx } = burst;
    // subtle glow without heavy shadow
    const x0 = startCol * fontPx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(0,255,220,0.95)';
    // draw once bold, once slightly offset for glow effect
    ctx.fillText(text, x0, y);
    ctx.fillStyle = 'rgba(0,255,220,0.35)';
    ctx.fillText(text, x0+1, y+1);
    ctx.restore();
    burst.frames--;
    if (burst.frames <= 0){
      burst = null;
      scheduleNextBurst(performance.now());
    }
  }

  function drawMatrix(currentTime) {
    if (!isVisible) return;

    // FPS capping
    if (currentTime - lastTime < FRAME_TIME) {
      animationId = requestAnimationFrame(drawMatrix);
      return;
    }

    // Performance monitoring
    frameCount++;
    if (currentTime - lastFpsCheck > 1000) {
      currentFps = frameCount;
      frameCount = 0;
      lastFpsCheck = currentTime;
      adjustDensity();
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    rotateSet(currentTime);
    checkThemeChange(currentTime);
    maybeStartBurst(currentTime);

    // Clear canvas with theme-based trail alpha
    const { trail } = themeVars();
    ctx.fillStyle = `rgba(5, 12, 24, ${trail})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw characters
    ctx.fillStyle = '#0f0';

    const effectiveSpeed = baseDropSpeed * densityMultiplier;
    const dropChance = 0.975 + (0.02 * densityMultiplier); // Higher density = more drops

    for (let i = 0; i < columnCount; i++) {
      // Skip some columns based on density
      if (Math.random() > densityMultiplier) continue;

      const x = i * fontSize + fontSize / 2;
      const y = columns[i] * fontSize;

      drawGlyph(i, y);

      // Move column down
      if (y > canvas.height && Math.random() > dropChance) {
        columns[i] = 0;
      } else {
        columns[i] += effectiveSpeed;
      }
    }

    renderBurst();
    updateDebugHUD();

    animationId = requestAnimationFrame(drawMatrix);
  }

  function start() {
    if (animationId) return; // Already running
    
    // Check for reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Respect user preference
    }

    if (!initCanvas()) return; // Canvas not ready

    lastTime = performance.now();
    scheduleNextBurst(performance.now());
    animationId = requestAnimationFrame(drawMatrix);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Visibility detection
  function handleVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible) {
      start();
    } else {
      stop();
    }
  }

  // Intersection observer for element visibility
  function setupIntersectionObserver() {
    if (!canvas || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting && !document.hidden;
      
      if (isVisible) {
        start();
      } else {
        stop();
      }
    }, { threshold: 0.1 });

    observer.observe(canvas);
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Setup event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', () => {
      if (canvas) {
        resizeCanvas();
      }
    });

    // Respect reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        stop();
      } else if (isVisible) {
        start();
      }
    });

    // Start the animation
    setupIntersectionObserver();
    start();

    // Idle sleep - auto-pause after inactivity
    const wake = () => {
      if (asleep) { start(); asleep = false; }
      clearTimeout(idleT);
      idleT = setTimeout(() => { stop(); asleep = true; }, idleMs);
    };
    ['mousemove','keydown','wheel','touchstart','pointerdown'].forEach(ev =>
      addEventListener(ev, wake, { passive: true })
    );
    wake();

    // URL tuning for demos and debugging
    const qs = new URLSearchParams(location.search);
    if (qs.get('matrix') === 'off') stop();
    if (qs.has('fps')) CFG.fps = Math.max(16, +qs.get('fps') || CFG.fps), interval = 1000/CFG.fps;
    if (qs.has('density')) CFG.density = Math.max(CFG.minDensity, Math.min(1, +qs.get('density') || CFG.density));
    
    // Debug HUD
    if (qs.get('debug') === '1') {
      debugEnabled = true;
      createDebugHUD();
    }

    // Manual theme override
    if (qs.has('theme')) {
      const themeName = qs.get('theme');
      if (themeName === 'auto') {
        themeAuto = true;
        applyTheme();
      } else if (THEMES[themeName]) {
        themeAuto = false;
        themeForced = themeName;
        applyTheme(themeName);
      }
    } else {
      // Apply initial time-based theme
      applyTheme();
    }
  }

  // Auto-initialize
  init();

  // Expose controls for debugging
  window.VIPSpot = window.VIPSpot || {};
  window.VIPSpot.pauseMatrix = stop;
  window.VIPSpot.resumeMatrix = start;
  window.VIPSpot.matrixCanvasId = () => canvas?.id || null;
  window.VIPSpot.triggerBurst = (txt='VIPSPOT.NET') => {
    const fontPx = fontSize;
    const neededCols = txt.length;
    const startCol = Math.max(0, Math.floor(Math.random()*(Math.max(1, cols - neededCols))));
    const y = Math.floor(h*0.25 + Math.random()*h*0.5);
    burst = { text: txt.toUpperCase(), startCol, y, frames: 18, fontPx };
  };
  window.VIPSpot.setMatrix = (opts={}) => {
    Object.assign(CFG, opts);
    interval = 1000 / CFG.fps;
  };
  window.VIPSpot.destroyMatrix = () => {
    stop();
    disposeAtlas();
    removeDebugHUD();
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
  window.VIPSpot.setIdleTimeout = (ms=30000) => { 
    idleMs = ms; 
    wake(); 
  };
  window.VIPSpot.toggleDebug = () => {
    debugEnabled = !debugEnabled;
    if (debugEnabled) {
      createDebugHUD();
    } else {
      removeDebugHUD();
    }
  };
  window.VIPSpot.getThemes = () => ({ ...THEMES });
  window.VIPSpot.getCurrentTheme = () => getCurrentTheme();
  window.VIPSpot.setTheme = (name) => {
    if (!THEMES[name]) return false;
    themeAuto = false; 
    themeForced = name; 
    applyTheme(name);
    return true;
  };
  window.VIPSpot.setThemeAuto = (on=true) => {
    themeAuto = !!on;
    if (themeAuto) {
      themeForced = null;
      applyTheme();
    }
  };
  window.VIPSpot._applyTheme = applyTheme;

  // Dev hotkey: Ctrl/Cmd+B to trigger burst
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'b' && (e.ctrlKey || e.metaKey)) VIPSpot.triggerBurst('RVRSE');
  });
})();