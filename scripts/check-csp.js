import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const candidates = [
  resolve('dist/index.html'),
  resolve('index.html')
];

let html = '';
let sourcePath = '';

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

for (const candidate of candidates) {
  try {
    html = await readFile(candidate, 'utf8');
    sourcePath = candidate;
    break;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      fail(`Failed to read ${candidate}: ${error.message}`);
    }
  }
}

if (!html) {
  fail('Unable to locate index.html (checked dist/index.html and index.html).');
}

const matches = [...html.matchAll(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi)];

if (matches.length !== 1) {
  fail(`Expected exactly one CSP meta tag, found ${matches.length}.`);
}

const metaTag = matches[0][0];
const contentMatch = metaTag.match(/content="([\s\S]*?)"/i);

if (!contentMatch) {
  fail('CSP meta tag is missing a content attribute.');
}

const policy = contentMatch[1].replace(/\s+/g, ' ').trim();

if (!/script-src\s+'self'\s+https:\/\/plausible\.io/.test(policy)) {
  fail('script-src directive does not allow https://plausible.io.');
}

if (!/connect-src\s+'self'[^;]*https:\/\/plausible\.io/.test(policy)) {
  fail('connect-src directive does not allow https://plausible.io.');
}

if (/frame-ancestors/i.test(policy)) {
  fail('frame-ancestors directive should not be present in meta-delivered CSP.');
}

console.log(`✅ CSP check passed for ${sourcePath}`);
