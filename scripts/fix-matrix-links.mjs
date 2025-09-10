import fs from 'node:fs';

const CANON = process.env.CANON_URL || '';
if (!CANON) { console.error('Missing CANON_URL in env'); process.exit(2); }

const files = ["index.html","site/index.html","site/public/index.html"].filter(fs.existsSync);

let changed = false;
for (const file of files) {
  let html = fs.readFileSync(file,'utf8');
  const t = html.search(/Matrix\s*Rain\s*Effect/i);
  if (t === -1) continue;

  // Locate nearest container; prefer <article> or <li>, else fall back to nearest <a> region
  const openContainer = Math.max(html.lastIndexOf("<article", t), html.lastIndexOf("<li", t));
  const start = openContainer !== -1 ? openContainer : html.lastIndexOf("<a", t);
  const endArticle = html.indexOf("</article>", t);
  const endLi      = html.indexOf("</li>", t);
  const cardEnd    = [endArticle, endLi].filter(i=>i!==-1).sort((a,b)=>a-b)[0];
  const end = (cardEnd !== undefined) ? cardEnd + (html.slice(cardEnd).startsWith("</article>") ? 10 : 5) : html.indexOf("</a>", t)+4;

  if (start < 0 || end < 0) { console.error(`[${file}] Could not bound Matrix card block`); continue; }

  const head = html.slice(0, start);
  const block = html.slice(start, end);
  const tail = html.slice(end);

  // Replace ALL anchors inside the block to canonical, EXCEPT internal or mailto
  const updated = block.replace(/(<a\b[^>]*href=")([^"]*)("[^>]*>)/gi, (m, pre, url, post) => {
    const lower = (url||'').toLowerCase();
    if (lower.startsWith('mailto:')) return m;
    if (lower.includes('vipspot.net')) return m;
    // any external anchor inside Matrix card -> canonical CodePen
    return pre + CANON + post;
  });

  if (updated !== block) {
    html = head + updated + tail;
    fs.writeFileSync(file, html);
    changed = true;
    console.log(`Updated Matrix anchors in ${file}`);
  }
}

if (!changed) {
  console.log('No Matrix anchors updated (already canonical or card not found).');
}