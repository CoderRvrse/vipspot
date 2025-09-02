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
       "Expected exactly one CSP <meta> tag");

  // style-src present & strict (no unsafe-inline)
  must(/style-src[^"]*'self'/.test(html), "CSP must include style-src 'self'");
  must(!/style-src[^"]*'unsafe-inline'/.test(html), "CSP must NOT include 'unsafe-inline'");

  // Explicit elem directive for external sheets
  must(/style-src-elem[^"]*https:\/\/fonts\.googleapis\.com/.test(html),
       "CSP must allow Google Fonts via style-src-elem");
  must(/style-src-elem[^"]*https:\/\/cdnjs\.cloudflare\.com/.test(html),
       "CSP must allow cdnjs via style-src-elem");

  // Block inline styles
  must(!/<style[^>]*>/.test(html), "No inline <style> blocks allowed");
  must(!/\sstyle=/.test(html.replace(/<[^>]*assets\//g, "")),
       "No inline style=\"...\" attributes allowed");

  console.log("✅ VIPSpot DOM markers OK @", ORIGIN);
  process.exit(0);
} catch (e) {
  console.error("❌ Prove failed:", e?.message || e);
  process.exit(1);
}