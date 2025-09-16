/**
 * Branding consistency guard for Featured Pens.
 * - Ensures brand mentions (VIPSpot, CoderRvrse) are present near the section.
 * - Ensures all external anchors to CodePen have rel="noopener noreferrer"
 *   and optionally allow rel*="me" (profile assertion).
 * - Optional: if UTM enforcement is toggled on, assert ?utm_* params exist.
 */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const CANDIDATES = [
  "index.html",
  "site/index.html",
  "site/public/index.html"
].filter(fs.existsSync);

const REQUIRE_UTM = true;  // toggle to true if/when you want strict UTM enforcement
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"];

const failures = [];
let scanned = 0;

for (const file of CANDIDATES) {
  const html = fs.readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Try to find a Featured Pens section wrapper
  const sec = Array.from(doc.querySelectorAll("section,div"))
    .find(el => /Featured\s*Pens/i.test(el.textContent || ""));

  if (!sec) continue; // not on this page
  scanned++;

  // 2.1 Brand mentions (soft assert: check whole page for brand presence)
  const pageTxt = (doc.body.textContent || "").toLowerCase();
  if (!/vipspot/.test(pageTxt) && !/coderrvrse/.test(pageTxt)) {
    failures.push(`[${file}] Page lacks visible brand mentions (VIPSpot/CoderRvrse).`);
  }

  // 2.2 External CodePen links: rel="noopener noreferrer" (+ optional "me")
  const aTags = Array.from(sec.querySelectorAll('a[href*="codepen.io"]'));
  for (const a of aTags) {
    const rel = (a.getAttribute("rel") || "").toLowerCase().trim();
    if (!(rel.includes("noopener") && rel.includes("noreferrer"))) {
      failures.push(`[${file}] <a href="${a.getAttribute("href")}"> missing rel="noopener noreferrer".`);
    }
    // "me" is optional; do not fail if absent
  }

  // 2.3 Optional UTM enforcement
  if (REQUIRE_UTM) {
    for (const a of aTags) {
      const href = a.getAttribute("href") || "";
      const q = href.split("?")[1] || "";
      const params = new URLSearchParams(q);
      for (const key of UTM_KEYS) {
        if (!params.has(key)) {
          failures.push(`[${file}] <a href="${href}"> missing ${key} (UTM enforcement ON).`);
        }
      }
    }
  }

  // 2.4 Assert new Facebook link present and canonicalized with UTM
  const FACEBOOK = 'https://www.facebook.com/people/VipSpot/100081136441464/';
  const utm = '?utm_source=vipspot&utm_medium=footer&utm_campaign=social';
  if (!(html.includes(FACEBOOK) && html.includes(utm))) {
    failures.push(`[${file}] Footer must link to VIPSpot Facebook with UTM params`);
  }

  // 2.5 Assert Twitter removed
  if (/twitter\.com/i.test(html)) {
    failures.push(`[${file}] Legacy Twitter link should be removed from footer`);
  }

  // 2.6 Assert new Facebook button has fb-btn class and proper UTM
  const fbBtn = doc.querySelector('.fb-btn');
  if (!fbBtn) {
    failures.push(`[${file}] Footer must have Facebook button with class "fb-btn"`);
  } else {
    const href = fbBtn.getAttribute('href') || '';
    if (!href.includes('utm_source=vipspot&utm_medium=footer&utm_campaign=social')) {
      failures.push(`[${file}] Facebook button missing required UTM parameters`);
    }
  }
}

if (scanned === 0) {
  failures.push("No Featured Pens section found in candidate files. Update candidates or selector.");
}

if (failures.length) {
  console.error("❌ Branding consistency failed:\n" + failures.map(x => " - " + x).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Branding consistency OK.");
}