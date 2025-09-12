/**
 * Utility Tests - VIPSpot Portfolio
 * Tests utility functions and scripts
 */

import { describe, test, expect } from '@jest/globals';

describe('VIPSpot Utilities', () => {
  describe('URL Validation', () => {
    test('should validate VIPSpot API URLs', () => {
      const validApiUrls = [
        'https://vipspot-api-a7ce781e1397.herokuapp.com',
        'https://vipspot-api-a7ce781e1397.herokuapp.com/healthz',
        'https://vipspot-api-a7ce781e1397.herokuapp.com/contact'
      ];

      validApiUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
        expect(new URL(url).protocol).toBe('https:');
      });
    });

    test('should validate Featured Pens URLs with UTM tracking', () => {
      const featuredPensUrls = [
        'https://codepen.io/CoderRvrse/pen/VYvNzzN?utm_source=github&utm_medium=readme&utm_campaign=featured_pen_3d_card',
        'https://codepen.io/CoderRvrse/pen/azvxEZG?utm_source=github&utm_medium=readme&utm_campaign=featured_pen_matrix'
      ];

      featuredPensUrls.forEach(url => {
        const urlObj = new URL(url);
        expect(urlObj.hostname).toBe('codepen.io');
        expect(urlObj.searchParams.get('utm_source')).toBe('github');
        expect(urlObj.searchParams.get('utm_medium')).toBe('readme');
        expect(urlObj.searchParams.has('utm_campaign')).toBe(true);
      });
    });
  });

  describe('Email Validation', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'contact@vipspot.net',
        'dev+portfolio@examplemail.invalid'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..email@example.com',
        'test@example',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Contact Email Requirements', () => {
    test('should use contact@vipspot.net as primary contact', () => {
      const contactEmail = 'contact@vipspot.net';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(contactEmail)).toBe(true);
      expect(contactEmail.includes('vipspot.net')).toBe(true);
      expect(contactEmail.startsWith('contact@')).toBe(true);
    });

    test('should reject legacy email domains', () => {
      const legacyDomains = ['legacy-domain.invalid','examplemail.invalid','old@example.invalid'];
      const contactEmail = 'contact@vipspot.net';
      
      legacyDomains.forEach(domain => {
        expect(contactEmail.includes(domain)).toBe(false);
      });
    });
  });

  describe('UTM Parameter Generation', () => {
    const generateUTMUrl = (baseUrl, source, medium, campaign, content = null) => {
      const url = new URL(baseUrl);
      url.searchParams.set('utm_source', source);
      url.searchParams.set('utm_medium', medium);
      url.searchParams.set('utm_campaign', campaign);
      if (content) {
        url.searchParams.set('utm_content', content);
      }
      return url.toString();
    };

    test('should generate proper UTM URLs for GitHub README', () => {
      const baseUrl = 'https://vipspot.net';
      const utmUrl = generateUTMUrl(baseUrl, 'github', 'readme', 'badge_click');
      
      expect(utmUrl).toContain('utm_source=github');
      expect(utmUrl).toContain('utm_medium=readme');
      expect(utmUrl).toContain('utm_campaign=badge_click');
    });

    test('should generate CodePen UTM URLs correctly', () => {
      const baseUrl = 'https://codepen.io/CoderRvrse/pen/VYvNzzN';
      const utmUrl = generateUTMUrl(baseUrl, 'github', 'readme', 'featured_pen_3d_card', 'demo_links');
      
      expect(utmUrl).toContain('utm_source=github');
      expect(utmUrl).toContain('utm_medium=readme');
      expect(utmUrl).toContain('utm_campaign=featured_pen_3d_card');
      expect(utmUrl).toContain('utm_content=demo_links');
    });
  });

  describe('Release Version Format', () => {
    const validateVersionFormat = (version) => {
      // VIPSpot uses vYYYY.MM.DD or vYYYY.MM.DD-type format
      const versionRegex = /^v\d{4}\.\d{1,2}\.\d{1,2}(-\w+)?$/;
      return versionRegex.test(version);
    };

    test('should validate VIPSpot version format', () => {
      const validVersions = [
        'v2025.09.12',
        'v2025.09.12-feat',
        'v2025.09.12-fix',
        'v2025.09.12-docs',
        'v2025.1.1',
        'v2025.12.31-major'
      ];

      validVersions.forEach(version => {
        expect(validateVersionFormat(version)).toBe(true);
      });
    });

    test('should reject invalid version formats', () => {
      const invalidVersions = [
        '2025.09.12',
        'v2025.9',
        'v2025.09.32',
        'v2025.13.01',
        'v25.09.12',
        'version-1.0.0'
      ];

      invalidVersions.forEach(version => {
        expect(validateVersionFormat(version)).toBe(false);
      });
    });
  });

  describe('Security Helpers', () => {
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '')
                  .trim();
    };

    test('should sanitize potentially dangerous input', () => {
      const dangerousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<div onclick="alert(\'xss\')">Click me</div>',
        '<img onerror="alert(\'xss\')" src="x">'
      ];

      dangerousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized.toLowerCase()).not.toContain('<script>');
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
        expect(sanitized.toLowerCase()).not.toContain('onclick=');
        expect(sanitized.toLowerCase()).not.toContain('onerror=');
      });
    });

    test('should preserve safe input', () => {
      const safeInputs = [
        'Hello, I need help with my project',
        'My email is john@example.com',
        'Check out my website: https://example.com',
        'Price range: $1,000 - $5,000'
      ];

      safeInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe(input);
      });
    });
  });
});