/**
 * VIPSpot Analytics Hooks (Plausible)
 * - Logs readiness once Plausible is available
 * - Emits 'discord_cta_click' when the footer CTA is clicked
 * - Tracks featured_pen_click on CodePen links
 * - Monitors reading_time with heartbeat and focus/blur events
 * CSP: loaded as a separate JS file from 'self' (no inline handlers required)
 */
(() => {
  // Wait until DOM is ready
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  // safe get plausible
  function hasPlausible(){ return typeof window !== 'undefined' && typeof window.plausible === 'function'; }

  // Plausible readiness log + Discord CTA
  ready(() => {
    if (hasPlausible()) {
      try { console.info('Plausible ready for vipspot.net'); } catch (_) {}
    }

    // Attach event for footer CTA if present
    const cta = document.querySelector('#vip-discord');
    if (cta) {
      cta.addEventListener('click', () => {
        if (hasPlausible()) {
          try { window.plausible('discord_cta_click', { props: { placement: 'footer' } }); } catch (_) {}
        }
      }, { passive: true });
    }
  });

  // Featured pen tracking (CodePen cards/links)
  ready(() => {
    function extractPenId(href){
      try {
        // Supports /pen/<ID> and /full/<ID> etc.
        const m=(href||'').match(/codepen\.io\/[^/]+\/(?:pen|full|details)\/([A-Za-z0-9]+)/i);
        return m ? m[1] : null;
      } catch { return null; }
    }

    const anchors = new Set();
    document.querySelectorAll('.codepen-card a[href], a[href*="codepen.io"]').forEach(a => anchors.add(a));

    anchors.forEach(a => {
      a.addEventListener('click', () => {
        if (!hasPlausible()) return;
        const penId = extractPenId(a.href);
        try {
          window.plausible('featured_pen_click', {
            props: { pen_id: penId || 'unknown', placement: 'portfolio' }
          });
        } catch(_){}
      }, { passive: true });
    });
  });

  // Reading time heartbeat + focus/blur events
  ready(() => {
    if (!('visibilityState' in document)) return;
    let activeTime = 0;
    let timer = null;

    function tick(){
      if (!document.hidden && hasPlausible()) {
        activeTime += 30;
        try {
          window.plausible('reading_time', {
            props: { duration_seconds: activeTime, page: location.pathname }
          });
        } catch(_){}
      }
    }

    // start heartbeat
    timer = setInterval(tick, 30000);

    // visibility events
    document.addEventListener('visibilitychange', () => {
      if (!hasPlausible()) return;
      try { window.plausible(document.hidden ? 'page_blur' : 'page_focus'); } catch(_){}
    });
  });
})();