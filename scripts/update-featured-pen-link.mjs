import fs from 'node:fs';
import path from 'node:path';

const NEW_URL = "https://codepen.io/CoderRvrse/pen/VYvNzzN";

// candidate HTML files to scan (add more if site/ exists)
const candidates = [
  "index.html",
  "site/index.html",
  "site/public/index.html"
].filter(fs.existsSync);

const read = p => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);

function findEnclosingBlock(html, title) {
  // Look for the "3D Card Hover" text in the HTML
  const tIdx = html.indexOf("3D Card Hover");
  if (tIdx === -1) return null;

  // find nearest opening <li before the title
  const openIdx = html.lastIndexOf("<li>", tIdx);
  if (openIdx === -1) return null;

  // find closing </li> after the title
  const closeIdx = html.indexOf("</li>", tIdx);
  if (closeIdx === -1) return null;
  
  return { start: openIdx, end: closeIdx + 5 };
}

let changed = false;

for (const file of candidates) {
  let html = read(file);
  const blk = findEnclosingBlock(html, "3D Card Hover");
  if (!blk) continue;

  const before = html;

  const head = html.slice(0, blk.start);
  const block = html.slice(blk.start, blk.end);
  const tail = html.slice(blk.end);

  // Replace hrefs inside this block:
  const updatedBlock = block.replace(
    /(<a\b[^>]*href=")([^"]*)("[^>]*>)/gi,
    (m, pre, url, post) => {
      const lower = url.toLowerCase();
      if (lower.startsWith("mailto:")) return m;           // leave mailto
      if (lower.includes("vipspot.net") && !lower.includes("codepen")) return m;         // leave internal site link
      // otherwise, point to NEW_URL
      return pre + NEW_URL + post;
    }
  );

  html = head + updatedBlock + tail;

  if (html !== before) {
    write(file, html);
    changed = true;
    console.log(`Updated: ${file}`);
  }
}

if (!changed) {
  console.error("No updates made. Could not find the 3D Card Hover block or no hrefs to change.");
  process.exit(2);
} else {
  console.log("Done.");
}