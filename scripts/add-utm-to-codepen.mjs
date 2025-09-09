import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const FILES = ["index.html","site/index.html","site/public/index.html"].filter(fs.existsSync);
const UTM = { utm_source: "vipspot", utm_medium: "featured_pens", utm_campaign: "portfolio" };

function addUtm(url) {
  try {
    const u = new URL(url, "https://vipspot.net"); // base for relative
    if (!/codepen\.io/i.test(u.hostname)) return url;
    // Replace existing UTM parameters with canonical ones
    for (const [k,v] of Object.entries(UTM)) u.searchParams.set(k, v);
    return u.toString();
  } catch { return url; }
}

let changed = false;

for (const file of FILES) {
  const html = fs.readFileSync(file, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Scope to Featured Pens container by text
  const section = Array.from(doc.querySelectorAll("section,div"))
    .find(el => /Featured\s*Pens/i.test(el.textContent || ""));
  if (!section) continue;

  const anchors = Array.from(section.querySelectorAll('a[href*="codepen.io"]'));
  for (const a of anchors) {
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

if (!changed) console.log("No UTM changes needed.");
