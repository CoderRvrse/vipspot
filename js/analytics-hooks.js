/**
 * VIPSpot Analytics Hooks (Plausible)
 * - Logs readiness once Plausible is available
 * - Emits 'discord_cta_click' when the footer CTA is clicked
 * CSP: loaded as a separate JS file from 'self' (no inline handlers required)
 */
(() => {
  // Wait until DOM is ready
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  // safe get plausible
  function hasPlausible(){ return typeof window !== 'undefined' && typeof window.plausible === 'function'; }

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
})();