import fs from 'node:fs';
const FILES = ["index.html","site/index.html","site/public/index.html"].filter(fs.existsSync);
function updateByTitle({ titleRegex, newUrl }) {
  for (const file of FILES) {
    let html = fs.readFileSync(file, 'utf8');
    const tIdx = html.search(titleRegex);
    if (tIdx === -1) continue;
    const openIdx  = html.lastIndexOf('<a', tIdx);
    const closeIdx = html.indexOf('</a>',  tIdx);
    if (openIdx === -1 || closeIdx === -1) continue;
    const endIdx = closeIdx + 4;
    const head = html.slice(0, openIdx);
    const block = html.slice(openIdx, endIdx);
    const tail = html.slice(endIdx);
    const replaced = block.replace(/href="[^"]*"/i, `href="${newUrl}"`);
    if (replaced !== block) {
      fs.writeFileSync(file, head + replaced + tail);
      console.log(`Updated ${file} → ${newUrl}`);
      return true;
    }
  }
  return false;
}
const [,, pat, url] = process.argv;
if (!pat || !url) { console.error('Usage: node scripts/update-featured-pen-link.mjs "<regex>" "<url>"'); process.exit(2); }
if (!updateByTitle({ titleRegex: new RegExp(pat, 'i'), newUrl: url })) {
  console.error('Card not found or href unchanged.'); process.exit(3);
}
