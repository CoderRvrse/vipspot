/**
 * Verifies Featured Pens links without network access.
 * - Locates the 3D Card Hover card block by title text.
 * - Asserts all <a> hrefs inside that block point to the canonical CodePen URL.
 * - Ensures other pens are untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const CANON_URL = "https://codepen.io/CoderRvrse/pen/VYvNzzN";
const MATRIX_BASE = "https://codepen.io/CoderRvrse/pen/azvxEZG";
const REQ_UTM = ["utm_source","utm_medium","utm_campaign"];

// Candidate HTML files (adjust/add if your site uses partials)
const CANDIDATES = [
  "index.html",
  "site/index.html",
  "site/public/index.html"
].filter(fs.existsSync);

// Simple util
const read = (p) => fs.readFileSync(p, "utf8");

let foundBlock = false;
let failures = [];

for (const file of CANDIDATES) {
  const html = read(file);
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find the card by text "3D Card Hover" in any element
  // Match case-insensitively and tolerate whitespace
  const allElements = Array.from(doc.querySelectorAll("*"));
  const titleNode = allElements.find(el =>
    /3D\s*Card\s*Hover/i.test(el.textContent || "") && 
    // Ensure we don't match parent elements that contain child text
    el.children.length === 0
  );

  if (!titleNode) continue;

  // Find nearest enclosing article or list item for the card block
  let container = titleNode.closest("article,li") || titleNode.parentElement;
  if (!container) {
    failures.push(`[${file}] Could not resolve enclosing card container for "3D Card Hover".`);
    continue;
  }

  foundBlock = true;

  // Collect all anchors inside block
  const anchors = Array.from(container.querySelectorAll("a[href]"));

  if (anchors.length === 0) {
    failures.push(`[${file}] "3D Card Hover" block contains no anchors to validate.`);
  } else {
    // All anchors in this block must point to the canonical CodePen URL (base URL, UTM params allowed)
    const bad = anchors.filter(a => {
      const href = a.getAttribute("href") || "";
      try {
        const url = new URL(href);
        // Remove query parameters for comparison
        const baseUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
        return baseUrl !== CANON_URL;
      } catch {
        return href !== CANON_URL;
      }
    });
    if (bad.length > 0) {
      const samples = bad.slice(0, 3).map(a => a.getAttribute("href"));
      failures.push(
        `[${file}] Found anchors in "3D Card Hover" block that do not point to canonical URL base.\n` +
        `  Expected base: ${CANON_URL}\n` +
        `  Offenders (sample): ${samples.join(", ")}`
      );
    }
  }

  // OPTIONAL: sanity for other pens if they're on the same page
  const otherPens = [
    { name: "Neon Button Kit", pattern: /Neon\s*Button\s*Kit/i },
    { name: "Matrix Rain Effect", pattern: /Matrix\s*Rain\s*Effect/i }
  ];

  for (const { name, pattern } of otherPens) {
    const n = allElements.find(el => 
      pattern.test(el.textContent || "") && el.children.length === 0
    );
    if (!n) continue; // not on this file
    // We just ensure they have at least one anchor and do NOT equal the 3D card base URL
    const c = n.closest("article,li") || n.parentElement;
    if (!c) continue;
    const a = c.querySelector("a[href]");
    if (a) {
      const href = a.getAttribute("href") || "";
      try {
        const url = new URL(href);
        const baseUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
        if (baseUrl === CANON_URL) {
          failures.push(`[${file}] Unexpected link equality: "${name}" uses the 3D Card Hover base URL.`);
        }
      } catch {
        if (href === CANON_URL) {
          failures.push(`[${file}] Unexpected link equality: "${name}" uses the 3D Card Hover URL.`);
        }
      }
    }
  }
}

// === Matrix Rain Effect block check ===
for (const file of CANDIDATES) {
  const html = fs.readFileSync(file,'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const allElements2 = Array.from(doc.querySelectorAll("*"));
  const matrixTitleNode = allElements2.find(el =>
    /Matrix\s*Rain\s*Effect/i.test(el.textContent || "") && 
    el.children.length === 0
  );
  if (!matrixTitleNode) continue;
  const card = matrixTitleNode.closest('article,li') || matrixTitleNode.parentElement;
  if (!card) { failures.push(`[${file}] Could not resolve Matrix card container.`); continue; }
  const links = Array.from(card.querySelectorAll('a[href]'));
  if (!links.length) { failures.push(`[${file}] Matrix card has no anchors.`); continue; }
  for (const a of links) {
    const href = a.getAttribute('href')||'';
    if (!href.startsWith(MATRIX_BASE)) {
      failures.push(`[${file}] Matrix href not starting with base ${MATRIX_BASE}: ${href}`);
      continue;
    }
    const q = href.split('?')[1]||''; const u = new URLSearchParams(q);
    for (const k of REQ_UTM) if (!u.has(k)) failures.push(`[${file}] Matrix href missing ${k}: ${href}`);
  }
}


if (!foundBlock) {
  failures.push(`Could not locate "3D Card Hover" card in any candidate file: ${CANDIDATES.join(", ")}`);
}

if (failures.length) {
  console.error("❌ Featured Pens link verification failed:\n" + failures.map(x => " - " + x).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Featured Pens links verified: 3D Card Hover → " + CANON_URL);
}