/**
 * Adds UTM params to all CodePen links inside Featured Pens section.
 * Idempotent: merges without duplicating keys.
 */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const CANDIDATES = ["index.html","site/index.html","site/public/index.html"].filter(fs.existsSync);
const UTM = {
  utm_source: "vipspot",
  utm_medium: "featured_pens",
  utm_campaign: "portfolio"
};

function addUtm(url) {
  try {
    const u = new URL(url);
    if (!/codepen\.io/i.test(u.hostname)) return url;
    for (const [k,v] of Object.entries(UTM)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}

let changed = false;

for (const file of CANDIDATES) {
  const html = fs.readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const sec = Array.from(doc.querySelectorAll("section,div"))
    .find(el => /Featured\s*Pens/i.test(el.textContent || ""));

  if (!sec) continue;

  const aTags = Array.from(sec.querySelectorAll('a[href*="codepen.io"]'));
  for (const a of aTags) {
    const before = a.getAttribute("href") || "";
    const after  = addUtm(before);
    if (after !== before) {
      a.setAttribute("href", after);
      changed = true;
      console.log(`UTM: ${before} -> ${after}`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, dom.serialize());
    console.log(`Updated ${file}`);
  }
}

if (!changed) console.log("No UTM changes needed (already canonical).");