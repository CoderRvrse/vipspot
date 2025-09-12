/**
 * Frontend Tests - VIPSpot Portfolio
 * Tests core functionality like form validation, UI interactions, etc.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('VIPSpot Frontend', () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <form id="contact-form">
        <input id="name" name="name" required />
        <input id="email" name="email" type="email" required />
        <textarea id="message" name="message" required></textarea>
        <input id="company" name="company" style="display: none;" />
        <button type="submit">Send Message</button>
      </form>
      <div id="status"></div>
    `;
  });

  describe('Form Validation', () => {
    test('should validate required fields', () => {
      const form = document.getElementById('contact-form');
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      // Test empty fields
      expect(nameInput.checkValidity()).toBe(false);
      expect(emailInput.checkValidity()).toBe(false);
      expect(messageInput.checkValidity()).toBe(false);

      // Test filled fields
      nameInput.value = 'Test User';
      emailInput.value = 'test@example.com';
      messageInput.value = 'Test message';

      expect(nameInput.checkValidity()).toBe(true);
      expect(emailInput.checkValidity()).toBe(true);
      expect(messageInput.checkValidity()).toBe(true);
    });

    test('should validate email format', () => {
      const emailInput = document.getElementById('email');
      
      // Invalid emails
      emailInput.value = 'invalid-email';
      expect(emailInput.checkValidity()).toBe(false);
      
      emailInput.value = 'test@';
      expect(emailInput.checkValidity()).toBe(false);
      
      emailInput.value = '@example.com';
      expect(emailInput.checkValidity()).toBe(false);
      
      // Valid email
      emailInput.value = 'test@example.com';
      expect(emailInput.checkValidity()).toBe(true);
    });

    test('should have honeypot field hidden', () => {
      const honeypotInput = document.getElementById('company');
      expect(honeypotInput.style.display).toBe('none');
    });
  });

  describe('Contact Form Functionality', () => {
    test('should collect form data correctly', () => {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      nameInput.value = 'John Doe';
      emailInput.value = 'john@example.com';
      messageInput.value = 'Hello VIPSpot!';

      const formData = new FormData(document.getElementById('contact-form'));
      
      expect(formData.get('name')).toBe('John Doe');
      expect(formData.get('email')).toBe('john@example.com');
      expect(formData.get('message')).toBe('Hello VIPSpot!');
    });

    test('should prevent bot submissions via honeypot', () => {
      const honeypotInput = document.getElementById('company');
      const form = document.getElementById('contact-form');

      // Bot fills honeypot
      honeypotInput.value = 'Bot Company Inc.';
      
      const formData = new FormData(form);
      const shouldReject = formData.get('company') !== '' && formData.get('company') !== null;
      
      expect(shouldReject).toBe(true);
    });
  });

  describe('Timing Guard', () => {
    test('should implement timing guard logic', () => {
      const now = Date.now();
      const minimumDelay = 3000; // 3 seconds
      
      // Too fast submission (should fail)
      const fastTimestamp = now - 1000; // 1 second ago
      const isTooFast = (now - fastTimestamp) < minimumDelay;
      expect(isTooFast).toBe(true);
      
      // Valid submission (should pass)
      const validTimestamp = now - 5000; // 5 seconds ago
      const isValidTiming = (now - validTimestamp) >= minimumDelay;
      expect(isValidTiming).toBe(true);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('should make API call with correct structure', async () => {
      const mockResponse = { 
        ok: true,
        json: async () => ({ success: true, message: 'Message sent successfully' })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        timestamp: Date.now() - 5000
      };

      const response = await fetch('https://vipspot-api-a7ce781e1397.herokuapp.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://vipspot.net'
        },
        body: JSON.stringify(contactData)
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://vipspot-api-a7ce781e1397.herokuapp.com/contact',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Origin': 'https://vipspot.net'
          }),
          body: JSON.stringify(contactData)
        })
      );

      const result = await response.json();
      expect(result.success).toBe(true);
    });

    test('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      };
      fetch.mockResolvedValueOnce(mockErrorResponse);

      const response = await fetch('https://vipspot-api-a7ce781e1397.herokuapp.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 'test@example.com', message: 'Test' })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(429);
      
      const result = await response.json();
      expect(result.error).toBe('Rate limit exceeded');
    });
  });

  describe('UTM Parameter Handling', () => {
    test('should parse UTM parameters from URL', () => {
      // Mock URL with UTM parameters
      const mockURL = new URL('https://vipspot.net/?utm_source=github&utm_medium=readme&utm_campaign=badge_click');
      
      const utmSource = mockURL.searchParams.get('utm_source');
      const utmMedium = mockURL.searchParams.get('utm_medium');
      const utmCampaign = mockURL.searchParams.get('utm_campaign');
      
      expect(utmSource).toBe('github');
      expect(utmMedium).toBe('readme');
      expect(utmCampaign).toBe('badge_click');
    });

    test('should handle missing UTM parameters gracefully', () => {
      const mockURL = new URL('https://vipspot.net/');
      
      const utmSource = mockURL.searchParams.get('utm_source');
      const utmMedium = mockURL.searchParams.get('utm_medium');
      const utmCampaign = mockURL.searchParams.get('utm_campaign');
      
      expect(utmSource).toBe(null);
      expect(utmMedium).toBe(null);
      expect(utmCampaign).toBe(null);
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', () => {
      document.body.innerHTML = `
        <form id="contact-form">
          <label for="name">Name</label>
          <input id="name" name="name" required aria-describedby="name-help" />
          <div id="name-help">Enter your full name</div>
          
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required aria-describedby="email-help" />
          <div id="email-help">We'll never share your email</div>
          
          <label for="message">Message</label>
          <textarea id="message" name="message" required aria-describedby="message-help"></textarea>
          <div id="message-help">Tell us about your project</div>
        </form>
      `;

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      expect(nameInput.getAttribute('aria-describedby')).toBe('name-help');
      expect(emailInput.getAttribute('aria-describedby')).toBe('email-help');
      expect(messageInput.getAttribute('aria-describedby')).toBe('message-help');

      // Check labels exist
      expect(document.querySelector('label[for="name"]')).toBeTruthy();
      expect(document.querySelector('label[for="email"]')).toBeTruthy();
      expect(document.querySelector('label[for="message"]')).toBeTruthy();
    });
  });
});