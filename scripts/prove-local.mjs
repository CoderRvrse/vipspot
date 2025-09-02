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

  // Minimal hard checks (no external libs)
  must(/<title>[^<]*VIPSpot 2025/i.test(html), "Missing or wrong <title>");
  must(/<link[^>]+href=["']css\/styles\.css["'][^>]*>/i.test(html), "styles.css not linked");
  must(/<script[^>]+src=["']js\/main\.js["'][^>]*defer/i.test(html), "main.js missing or not defer");
  must(/<canvas[^>]+id=["']matrix-bg["'][^>]*>/i.test(html), "#matrix-bg canvas missing");
  must(/<main[^>]+id=["']main-content["'][^>]*>/i.test(html), "<main id='main-content'> missing");
  must(/id=["']projects["']/.test(html), "#projects section missing");
  must(/id=["']contact["']/.test(html), "#contact section missing");
  must(/role=["']dialog["'][^>]*aria-modal=["']true["']/.test(html), "ARIA-compliant modal not found");
  must(/<meta[^>]+property=["']og:image["'][^>]+assets\/me-?1024\.png/i.test(html), "OG image not pointing to your photo");
  must(/<img[^>]+src=["']assets\/me-(512|768|1024)\.png["']/i.test(html), "Avatar image not found in DOM");
  must(/https:\/\/github\.com\/CoderRvrse/.test(html), "Footer GitHub link not set to CoderRvrse");

  // CSP tests - ensure exactly one CSP meta and strict policy
  must((html.match(/http-equiv=["']Content-Security-Policy["']/gi) || []).length === 1,
       "CSP meta must appear exactly once");

  // CSP before first stylesheet
  const iCSP = html.search(/<meta[^>]+http-equiv=["']Content-Security-Policy/i);
  const iCSS = html.search(/<link[^>]+rel=["']stylesheet/i);
  must(iCSP > -1 && (iCSS === -1 || iCSP < iCSS), "CSP must precede all stylesheets");

  // style-src present & strict (no unsafe-inline)
  must(/style-src[^"]*'self'/.test(html), "CSP must include style-src 'self'");
  must(!/unsafe-inline/.test(html), "CSP should not contain 'unsafe-inline'");

  // No external origins in CSP (all self-hosted)
  must(!/https:\/\/fonts\.googleapis\.com/.test(html), "CSP should not reference external font origins");
  must(!/fonts\.gstatic\.com/.test(html), "CSP should not reference external font file origins");

  // Ensure no cdnjs references exist
  must(!/cdnjs\.cloudflare\.com/.test(html), "No cdnjs references should exist");

  // Block inline styles (strict)
  must(!/<style[\s>]/i.test(html), "Inline <style> block found in HTML");
  must(!/\sstyle\s*=/i.test(html), "Inline style=\"...\" attribute found");

  // Check for JS-created style tags (coarse check)
  must(!/createElement\(\s*['"]style['"]\s*\)/i.test(html), "JS creates <style> at runtime");

  // Ensure fonts are self-hosted
  must(/<link[^>]+href=["']css\/fonts\.css["']/.test(html), "Local fonts.css must be linked");
  must(!/googleapis\.com/.test(html), "No Google Fonts references should exist in HTML");

  console.log("✅ VIPSpot DOM markers OK @", ORIGIN);
  process.exit(0);
} catch (e) {
  console.error("❌ Prove failed:", e?.message || e);
  process.exit(1);
}