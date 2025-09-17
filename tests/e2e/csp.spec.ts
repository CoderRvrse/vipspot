import { test, expect } from '@playwright/test';

test.describe('CSP & Analytics Smoke Tests', () => {
  test('should load site without CSP violations and Plausible analytics working', async ({ page }) => {
    const consoleMessages: string[] = [];
    const networkRequests: Array<{ url: string; status: number }> = [];

    // Capture console messages
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Capture network requests
    page.on('response', (response) => {
      networkRequests.push({
        url: response.url(),
        status: response.status()
      });
    });

    // Navigate to contact section
    await page.goto('https://vipspot.net/#contact', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Assert: No CSP violations in console (excluding frame-ancestors warning which is expected for meta tags)
    const cspViolations = consoleMessages.filter(msg =>
      (msg.includes('Content Security Policy') || msg.includes('Refused to') || msg.includes('blocked by CSP')) &&
      !msg.includes('frame-ancestors') &&
      !msg.includes('is ignored when delivered via a <meta> element')
    );

    expect(cspViolations, `CSP violations found: ${cspViolations.join(', ')}`).toHaveLength(0);

    // Assert: Plausible script loads successfully
    const plausibleRequests = networkRequests.filter(req =>
      req.url.includes('plausible.io/js/script.js')
    );

    expect(plausibleRequests.length, 'Plausible script should be requested').toBeGreaterThan(0);
    expect(plausibleRequests[0]?.status, 'Plausible script should load with 200 status').toBe(200);

    // Assert: HTML contains exactly one CSP meta tag
    const cspMetaTags = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    expect(cspMetaTags, 'Should have exactly one CSP meta tag').toBe(1);

    // Assert: CSP allows Plausible
    const cspContent = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(cspContent, 'CSP should allow Plausible script-src').toContain('script-src \'self\' https://plausible.io');
    expect(cspContent, 'CSP should allow Plausible connect-src').toContain('connect-src \'self\' https://vipspot-api-a7ce781e1397.herokuapp.com https://plausible.io');

    // Optional: Check for Plausible events (may not fire immediately)
    const plausibleEvents = networkRequests.filter(req =>
      req.url.includes('plausible.io/api/event')
    );

    // Note: Events might not fire immediately on page load, so this is informational
    console.log(`Plausible events detected: ${plausibleEvents.length}`);
  });

  test('should have proper security headers and CSP configuration', async ({ page }) => {
    const response = await page.goto('https://vipspot.net/', {
      waitUntil: 'domcontentloaded'
    });

    // Check response status
    expect(response?.status()).toBe(200);

    // Check that site is served with proper headers
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');

    // Verify CSP meta tag structure (meta tags are not "visible" but should exist)
    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toHaveCount(1);

    const cspContent = await cspMeta.getAttribute('content');
    expect(cspContent).toBeTruthy();

    // Verify critical CSP directives (note: frame-ancestors is ignored in meta tags)
    expect(cspContent).toContain('default-src \'self\'');
    expect(cspContent).toContain('object-src \'none\'');
    expect(cspContent).toContain('base-uri \'self\'');
  });
});