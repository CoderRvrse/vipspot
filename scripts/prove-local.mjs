// scripts/prove-local.mjs
// Fetches http://localhost:8000 and asserts critical markers exist.
// --- CI/Zero-network guard ---
const NO_NET = process.env.NO_NETWORK === '1' || process.env.CI === 'true';
if (NO_NET) {
  console.log('skip prove-local (no network in CI)');
  process.exit(0);
}
// --- end guard ---
import fs from 'fs';
const ORIGIN = process.env.VIP_ORIGIN || "http://localhost:8000";

function must(cond, msg) {
  if (!cond) {
    console.error("❌", msg);
    process.exit(1);
  }
}

try {
  const res = await fetch(ORIGIN, { redirect: "manual" }).catch(err => { console.warn('prove-local fetch suppressed:', err?.message || err); return { ok:false }; });
  must(res.ok, `Server not OK (${res.status}) at ${ORIGIN}`);
  const html = await res.text();
  
  // Fetch JS and CSS files for validation
  const jsRes = await fetch(`${ORIGIN}/js/matrix-bg.js`).catch(err => { console.warn('prove-local fetch suppressed:', err?.message || err); return { ok:false }; });
  const mainJsRes = await fetch(`${ORIGIN}/js/main.js`).catch(err => { console.warn('prove-local fetch suppressed:', err?.message || err); return { ok:false }; });
  const js = jsRes.ok ? await jsRes.text() : '';
  const mainJs = mainJsRes.ok ? await mainJsRes.text() : '';
  const css = fs.readFileSync("css/styles.css", "utf8");

  // Minimal hard checks (no external libs)
  must(/<title>[^<]*VIPSpot 2025/i.test(html), "Missing or wrong <title>");
  must(/<link[^>]+href=["']css\/styles\.css(?:\?v=[^"']*)?["'][^>]*>/i.test(html), "styles.css not linked");
  must(/<script[^>]+src=["']js\/main\.js(?:\?v=[^"']*)?["'][^>]*defer/i.test(html), "main.js missing or not defer");
  
  // Version consistency check (if versioned assets are present)
  const versionMatch = html.match(/\?v=([0-9-]{10,}-[0-9a-f]{7})/);
  if (versionMatch) {
    const version = versionMatch[1];
    const jsVersioned = new RegExp(`js/main\\.js\\?v=${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(html);
    const swVersioned = mainJs.includes(`/sw.js?v=${version}`);
    must(jsVersioned, `main.js not using consistent version: ${version}`);
    must(swVersioned, `SW registration not using consistent version: ${version}`);
    console.log(`✓ Consistent versioning: ${version}`);
  }
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
  must(!/<link[^>]+rel=["']stylesheet["'][^>]*href=["']https?:\/\//.test(html), "External stylesheet detected");
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

  // style-src present & allows inline CSS for Tailwind output
  must(/style-src[^"]*'self'/.test(html), "CSP must include style-src 'self'");
  must(/style-src[^"]*'unsafe-inline'/.test(html), "CSP must explicitly allow Tailwind inline styles");

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
  
  // Collect all IDs for validation
  const ids = Array.from(html.matchAll(/\sid=["']([^"']+)["']/g)).map(m => m[1]);
  const idSet = new Set(ids);
  
  // Articles must NOT carry overriding roles or tabindex
  must(!/<article[^>]*\srole=/.test(html), 
    "<article> must not override roles");
  
  must(!/<article[^>]*\stabindex=/.test(html),
    "<article> must not have tabindex");

  // Each project card must expose a real control
  must(/<article[\s\S]*?(<(button|a)[^>]*data-project=)/i.test(html),
    "Each project card needs a real <button>/<a> with data-project");

  // Modal container remains proper dialog
  must(/role=["']dialog["'][^>]*aria-modal=["']true["']/.test(html),
    "ARIA-compliant modal not found");
    
  // aria-labelledby / aria-describedby targets must exist
  for (const [, fullAttr, , val] of html.matchAll(/\s(aria-(labelledby|describedby))=["']([^"']+)["']/g)) {
    for (const ref of val.trim().split(/\s+/)) {
      must(idSet.has(ref), `Missing target id for ${fullAttr}: ${ref}`);
    }
  }

  // Buttons must have discernible text (non-empty)
  must(!/<button[^>]*>\s*<\/button>/i.test(html), 
    "Buttons must have discernible text");
    
  // Modal controls must have proper ARIA attributes
  must(/<button[^>]*data-project=[^>]*aria-haspopup=["']dialog["']/.test(html),
    "Project buttons must have aria-haspopup='dialog'");
    
  must(/<button[^>]*data-project=[^>]*aria-controls=/.test(html),
    "Project buttons must have aria-controls");
    
  must(/<button[^>]*data-project=[^>]*aria-expanded=["']false["']/.test(html),
    "Project buttons must have aria-expanded='false' initially");
    
  // Social profile links validation
  must(/<a[^>]*href=["']https:\/\/codepen\.io\/CoderRvrse[^"']*["'][^>]*aria-label=["']CodePen["']/.test(html),
    "CodePen profile link missing or incorrect");

  // Featured Pens presence
  must(/<section[^>]+id=["']pens["']/.test(html), "Featured Pens section missing");
  must((html.match(/class=["'][^"']*\bpen-card\b/g)||[]).length >= 3, "At least 3 pen cards required");

  // Pen links (with /pen/ in URL) must include UTM
  const penLinksWithoutUTM = html.match(/href=["']https?:\/\/codepen\.io\/[^"']*\/pen\/[^"'?]*["'](?![^>]*utm_)/g);
  must(!penLinksWithoutUTM || penLinksWithoutUTM.length === 0,
       "Pen links should include UTM parameters");

  // Pen images must be lazy + have dimensions (check each pen image)
  const penImages = html.match(/<img[^>]+src=["'][^"']*\/pens\/[^"']*["'][^>]*>/g) || [];
  penImages.forEach(imgTag => {
    must(/loading=["']lazy["']/.test(imgTag), "Pen images need loading=lazy");
    must(/decoding=["']async["']/.test(imgTag), "Pen images need decoding=async");  
    must(/width=["']\d+["']/.test(imgTag), "Pen images need width attribute");
    must(/height=["']\d+["']/.test(imgTag), "Pen images need height attribute");
  });

  // --- PREMIUM CONTACT FORM GUARDS ---
  
  // Contact form exists with novalidate
  must(/<form[^>]+id=["']contact-form["'][^>]*novalidate/i.test(html),
    "#contact-form must exist with novalidate attribute");
  
  // Contact submit button exists (not contact-send)
  must(/<button[^>]+id=["']contact-submit["']/.test(html),
    "#contact-submit button must be present");
  
  // Honeypot field present and properly hidden
  must(/<div[^>]+class=["'][^"']*\bhp-field\b[^"']*["'][^>]*aria-hidden=["']true["']/.test(html),
    "Honeypot field must have .hp-field class and aria-hidden='true'");
  
  must(/<input[^>]+name=["']company["']/.test(html),
    "Honeypot company input must be present");
  
  // Message field has proper maxlength (≥1200)
  const msgMaxLength = html.match(/<textarea[^>]+name=["']message["'][^>]*maxlength=["'](\d+)["']/);
  must(msgMaxLength && parseInt(msgMaxLength[1]) >= 1200,
    "Message field maxlength must be ≥1200 (found: " + (msgMaxLength ? msgMaxLength[1] : 'none') + ")");
  
  // Character counter element exists
  must(/id=["']msg-count["']/.test(html),
    "Character counter element #msg-count must exist");
  
  // Contact status with aria-live exists  
  must(/<div[^>]+id=["']contact-status["'][^>]*aria-live=["']polite["']/.test(html),
    "Contact status with aria-live='polite' must exist");
  
  // Verify honeypot is truly hidden in CSS
  must(/\.hp-field[^{]*\{[^}]*position:\s*absolute[^}]*\!/i.test(css),
    "Honeypot must have position:absolute!important in CSS");
  
  must(/\.hp-field[^{]*\{[^}]*opacity:\s*0/i.test(css),
    "Honeypot must have opacity:0 in CSS");

  console.log("✅ VIPSpot DOM + Mobile CTA + ARIA + Featured Pens + Premium Contact Form Guards OK @", ORIGIN);
  process.exit(0);
} catch (e) {
  console.error("❌ Prove failed:", e?.message || e);
  process.exit(1);
}