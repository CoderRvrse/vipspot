/**
 * Back-to-Top DOM Marker Test
 * Ensures the VIPSpot back-to-top component is properly integrated
 */

import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const html = readFileSync("index.html", "utf8");
const dom = new JSDOM(html);
const doc = dom.window.document;

const btn = doc.getElementById("vipspot-top");
if (!btn) {
  console.error("❌ Back-to-top button #vipspot-top missing.");
  process.exit(1);
}

if (!btn.classList.contains("vipspot-top")) {
  console.error("❌ Back-to-top button missing .vipspot-top class.");
  process.exit(1);
}

if (doc.querySelectorAll("#vipspot-top").length !== 1) {
  console.error("❌ Back-to-top button must be unique in DOM.");
  process.exit(1);
}

// Verify essential structure elements
const ring = btn.querySelector('.ring');
const glyph = btn.querySelector('.glyph');
const stars = btn.querySelector('.stars');

if (!ring) {
  console.error("❌ Back-to-top missing .ring progress indicator.");
  process.exit(1);
}

if (!glyph) {
  console.error("❌ Back-to-top missing .glyph arrow element.");
  process.exit(1);
}

if (!stars) {
  console.error("❌ Back-to-top missing .stars particle container.");
  process.exit(1);
}

// Verify accessibility attributes
if (!btn.getAttribute('aria-label')) {
  console.error("❌ Back-to-top missing aria-label.");
  process.exit(1);
}

if (!btn.getAttribute('title')) {
  console.error("❌ Back-to-top missing title attribute.");
  process.exit(1);
}

// Verify SR text is present
const srText = btn.querySelector('.sr-only');
if (!srText) {
  console.error("❌ Back-to-top missing screen reader text.");
  process.exit(1);
}

// Verify script is included
const scripts = Array.from(doc.querySelectorAll('script[src]')).map(s => s.src);
const hasBackToTopScript = scripts.some(src => src.includes('back-to-top.js'));
if (!hasBackToTopScript) {
  console.error("❌ Back-to-top script not included in HTML.");
  process.exit(1);
}

console.log("✅ Back-to-top DOM markers present and unique.");