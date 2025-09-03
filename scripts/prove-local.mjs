// scripts/prove-local.mjs
// Fetches http://localhost:8000 and asserts critical markers exist.
import fs from 'fs';
const ORIGIN = process.env.VIP_ORIGIN || "http://localhost:8000";

function must(cond, msg) {
  if (!cond) {
    console.error("❌", msg);
    process.exit(1);
  }
}

try {
  const res = await fetch(ORIGIN, { redirect: "manual" });
  must(res.ok, `Server not OK (${res.status}) at ${ORIGIN}`);
  const html = await res.text();
  
  // Fetch JS and CSS files for validation
  const jsRes = await fetch(`${ORIGIN}/js/matrix-bg.js`);
  const js = jsRes.ok ? await jsRes.text() : '';
  const css = fs.readFileSync("css/styles.css", "utf8");

  // Minimal hard checks (no external libs)
  must(/<title>[^<]*VIPSpot 2025/i.test(html), "Missing or wrong <title>");
  must(/<link[^>]+href=["']css\/styles\.css["'][^>]*>/i.test(html), "styles.css not linked");
  must(/<script[^>]+src=["']js\/main\.js["'][^>]*defer/i.test(html), "main.js missing or not defer");
  // Matrix canvas present exactly once, id is one of the allowed
  must((html.match(/<canvas[^>]+id=["']matrix-(?:canvas|bg)["']/gi)||[]).length===1,
      "Matrix canvas missing or duplicated");

  // Matrix API and features present in JS
  must(/VIPSpot\.setMatrix/.test(js) && /VIPSpot\.triggerBurst/.test(js) && /VIPSpot\.setTheme/.test(js),
      "Matrix API incomplete (setMatrix/triggerBurst/setTheme)");
  must(/ORDER\s*=\s*\[/.test(js), "Glyph rotation not detected");
  must(/buildAtlas\s*\(/.test(js) && /drawGlyph\s*\(/.test(js),
      "Matrix glyph atlas functions not found (buildAtlas/drawGlyph)");
  must(/disposeAtlas\s*\(/.test(js), "Atlas lifecycle management missing");
  
  // No debug HUD visible by default
  must(!/debug=1/.test(html), "Remove hardcoded debug HUD query");
  must(/<main[^>]+id=["']main-content["'][^>]*>/i.test(html), "<main id='main-content'> missing");
  must(/id=["']projects["']/.test(html), "#projects section missing");
  must(/id=["']contact["']/.test(html), "#contact section missing");
  must(/role=["']dialog["'][^>]*aria-modal=["']true["']/.test(html), "ARIA-compliant modal not found");
  must(/<meta[^>]+property=["']og:image["'][^>]+assets\/me-?1024\.png/i.test(html), "OG image not pointing to your photo");
  must(/<img[^>]+src=["']assets\/me-(512|768|1024)\.png["']/i.test(html), "Avatar image not found in DOM");
  must(/https:\/\/github\.com\/CoderRvrse/.test(html), "Footer GitHub link not set to CoderRvrse");

  // Hard fail if external stylesheets or scripts sneak in
  must(!/<link[^>]+href=["']https?:\/\//.test(html), "External stylesheet detected");
  must(!/<script[^>]+src=["']https?:\/\//.test(html), "External script detected");

  // Block font preloads (not needed with font-display: swap + self-hosted)
  must(!/<link[^>]+rel=["']preload["'][^>]+as=["']font["']/i.test(html),
       "Avoid <link rel=\"preload\" as=\"font\"> – not needed and triggers console warnings");

  // One and only one CSP, self-only policy verified
  must((html.match(/http-equiv=["']Content-Security-Policy["']/gi)||[]).length===1, "CSP meta missing or duplicated");
  must(/font-src\s+'self'(\s+data:)?;/.test(html), "font-src must be self (and optionally data:)");

  // CSP before first stylesheet
  const iCSP = html.search(/<meta[^>]+http-equiv=["']Content-Security-Policy/i);
  const iCSS = html.search(/<link[^>]+rel=["']stylesheet/i);
  must(iCSP > -1 && (iCSS === -1 || iCSP < iCSS), "CSP must precede all stylesheets");

  // style-src present & strict (no unsafe-inline)
  must(/style-src[^"]*'self'/.test(html), "CSP must include style-src 'self'");
  must(!/unsafe-inline/.test(html), "CSP should not contain 'unsafe-inline'");

  // No inline styles or style tags
  must(!/\sstyle=/.test(html), "Inline style attributes are forbidden");
  must(!/<style[\s>]/i.test(html), "Inline <style> blocks are forbidden");

  // fonts.css referenced
  must(/css\/fonts\.css/i.test(html), "fonts.css not linked");

  // Check for JS-created style tags (coarse check)
  must(!/createElement\(\s*['"]style['"]\s*\)/i.test(html), "JS creates <style> at runtime");

  // Ensure no external font references
  must(!/googleapis\.com/.test(html), "No Google Fonts references should exist in HTML");
  must(!/cdnjs\.cloudflare\.com/.test(html), "No cdnjs references should exist");

  // --- Mobile CTA Guards (bulletproof touch) ---
  
  // CTA must be a real anchor to #contact (no inline handlers)
  must(/<a[^>]+id=["']cta-build["'][^>]*href=["']#contact["'][^>]*>/.test(html),
    "CTA anchor not linking to #contact");
  
  must(!/<a[^>]+id=["']cta-build["'][^>]*onclick=/.test(html),
    "CTA must not use inline onclick");

  // Matrix canvas cannot steal taps
  must(/<canvas[^>]+id=["']matrix-(canvas|bg)["'][^>]*>/.test(html),
    "Matrix canvas with supported ID not found");
  
  must(/#matrix-(canvas|bg)[^{]*\{[^}]*pointer-events:\s*none/i.test(css),
    "Matrix canvas must have pointer-events:none");

  // Stacking context shield
  must(/\.hero-content[^{]*\{[^}]*isolation:\s*isolate/i.test(css),
    "CTA wrapper should set isolation:isolate");

  // Native-first smooth scrolling (with accessible fallback)
  must(/html[^{]*\{[^}]*scroll-behavior:\s*smooth/i.test(css),
    "Enable native smooth scroll in CSS");
  
  must(/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(css),
    "Respect prefers-reduced-motion in CSS");

  // Tap/keyboard UX polish
  must(/\.cta-button:active/i.test(css), "Pressed (:active) style missing");
  must(/:focus-visible/i.test(css), "Focus-visible outline missing");

  // --- ARIA Semantic Guards (prevent Lighthouse violations) ---
  
  // Articles must NOT carry overriding roles or tabindex
  must(!/<article[^>]*\srole=["'](?!article)/.test(html),
    "Do not assign ARIA roles to <article> (use link/button inside)");
  
  must(!/<article[^>]*\stabindex=/.test(html),
    "<article> must not be focusable; put focus on a child link/button");

  // Each project card must expose a real control
  must(/<article[\s\S]*?(<button[^>]*data-project=)/i.test(html),
    "Each project card needs a real <button> with data-project");

  // Modal container remains proper dialog
  must(/role=["']dialog["'][^>]*aria-modal=["']true["']/.test(html),
    "ARIA-compliant modal not found");

  console.log("✅ VIPSpot DOM + Mobile CTA + ARIA Guards OK @", ORIGIN);
  process.exit(0);
} catch (e) {
  console.error("❌ Prove failed:", e?.message || e);
  process.exit(1);
}