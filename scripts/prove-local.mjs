// scripts/prove-local.mjs
// Fetches http://localhost:8000 and asserts critical markers exist.
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
  
  // Fetch JS file for API checks
  const jsRes = await fetch(`${ORIGIN}/js/matrix-bg.js`);
  const js = jsRes.ok ? await jsRes.text() : '';

  // Minimal hard checks (no external libs)
  must(/<title>[^<]*VIPSpot 2025/i.test(html), "Missing or wrong <title>");
  must(/<link[^>]+href=["']css\/styles\.css["'][^>]*>/i.test(html), "styles.css not linked");
  must(/<script[^>]+src=["']js\/main\.js["'][^>]*defer/i.test(html), "main.js missing or not defer");
  // Matrix canvas present exactly once, id is one of the allowed
  must((html.match(/<canvas[^>]+id=["']matrix-(?:canvas|bg)["']/gi)||[]).length===1,
      "Matrix canvas missing or duplicated");

  // Matrix API and features present in JS
  must(/VIPSpot\.triggerBurst/.test(js), "Matrix API triggerBurst missing");
  must(/VIPSpot\.setMatrix/.test(js), "Matrix API setMatrix missing");
  must(/ORDER\s*=\s*\[/.test(js), "Glyph rotation not detected");
  must(/buildAtlas\s*\(/.test(js) && /drawGlyph\s*\(/.test(js),
      "Matrix glyph atlas functions not found (buildAtlas/drawGlyph)");
  must(/disposeAtlas\s*\(/.test(js), "Atlas lifecycle management missing");
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

  console.log("✅ VIPSpot DOM markers OK @", ORIGIN);
  process.exit(0);
} catch (e) {
  console.error("❌ Prove failed:", e?.message || e);
  process.exit(1);
}