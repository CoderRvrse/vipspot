#!/usr/bin/env node

/**
 * Simple CSP validation script for CI/CD
 * Checks that live site has proper CSP and Plausible analytics
 */

import https from 'https';
import { URL } from 'url';

const SITE_URL = 'https://vipspot.net';
const PLAUSIBLE_SCRIPT = 'https://plausible.io/js/script.js';

async function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'VIPSpot-CSP-Check/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking CSP configuration and analytics...\n');

  try {
    // Check main site
    console.log(`📡 Fetching ${SITE_URL}`);
    const siteResponse = await checkUrl(SITE_URL);

    if (siteResponse.status !== 200) {
      throw new Error(`Site returned ${siteResponse.status}`);
    }
    console.log('✅ Site accessible');

    // Check CSP meta tag
    const cspMatches = siteResponse.body.match(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (!cspMatches) {
      throw new Error('No CSP meta tag found');
    }

    const cspContent = cspMatches[1];
    console.log('✅ CSP meta tag present');

    // Validate CSP directives
    const requiredDirectives = [
      'default-src \'self\'',
      'script-src \'self\' https://plausible.io',
      'connect-src \'self\'',
      'https://vipspot-api-a7ce781e1397.herokuapp.com',
      'https://plausible.io'
    ];

    for (const directive of requiredDirectives) {
      if (!cspContent.includes(directive)) {
        throw new Error(`Missing CSP directive: ${directive}`);
      }
    }
    console.log('✅ CSP directives valid');

    // Check Plausible script accessibility
    console.log(`📡 Checking Plausible script: ${PLAUSIBLE_SCRIPT}`);
    const plausibleResponse = await checkUrl(PLAUSIBLE_SCRIPT);

    if (plausibleResponse.status !== 200) {
      throw new Error(`Plausible script returned ${plausibleResponse.status}`);
    }
    console.log('✅ Plausible script accessible');

    // Check content type
    const contentType = plausibleResponse.headers['content-type'];
    if (!contentType || !contentType.includes('javascript')) {
      console.warn(`⚠️  Plausible script has unexpected content-type: ${contentType}`);
    } else {
      console.log('✅ Plausible script content-type valid');
    }

    console.log('\n🎉 All CSP and analytics checks passed!');
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ CSP check failed: ${error.message}`);
    process.exit(1);
  }
}

main();