# Contributing Guide

Thank you for your interest in contributing to VIPSpot! This guide will help you get started with the development workflow and coding standards.

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/vipspot.git
cd vipspot
git remote add upstream https://github.com/CoderRvrse/vipspot.git
```

### 2. Create Feature Branch

Use the naming convention: `type/description-YYYY-MM-DD`

```bash
git checkout -b feat/new-feature-2025-09-12
git checkout -b fix/bug-description-2025-09-12  
git checkout -b docs/update-readme-2025-09-12
```

### 3. Make Changes

Follow the [coding standards](#coding-standards) and make your changes.

### 4. Test Locally

```bash
# Install dependencies
npm ci
cd api && npm ci

# Run tests (when available)
npm test

# Test locally
python -m http.server 8000  # Frontend
cd api && npm run dev       # API
```

### 5. Commit Changes

Use [conventional commits](https://conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new feature description"
git commit -m "fix: resolve bug in contact form"
git commit -m "docs: update API documentation"
```

### 6. Push and Create PR

```bash
git push origin feat/new-feature-2025-09-12
# Create pull request on GitHub
```

## Coding Standards

### General Guidelines

- **Clean Code**: Write readable, maintainable code
- **Comments**: Only when necessary to explain complex logic
- **Naming**: Use descriptive variable and function names
- **DRY**: Don't repeat yourself
- **YAGNI**: You aren't gonna need it

### JavaScript/Node.js

**Style:**
- Use `const` and `let`, avoid `var`
- Use arrow functions for short functions
- Use template literals for string interpolation
- Use async/await over promises when possible

**Example:**
```javascript
// Good
const processContact = async (data) => {
  const { name, email, message } = data;
  return await sendEmail({ name, email, message });
};

// Avoid
var processContact = function(data) {
  return sendEmail(data.name, data.email, data.message);
};
```

### HTML/CSS

**HTML:**
- Use semantic HTML5 elements
- Include ARIA attributes for accessibility
- Use proper heading hierarchy (h1 → h2 → h3)

**CSS:**
- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Use Flexbox/Grid for layouts

**Example:**
```css
/* Good */
.contact-form__input {
  --input-color: #00d4aa;
  border: 2px solid var(--input-color);
}

/* Avoid */
.input {
  border: 2px solid #00d4aa;
}
```

## Testing Guidelines

### Frontend Testing

When implementing tests, focus on:

- **User interactions**: Form submissions, button clicks
- **API integration**: Contact form API calls
- **Accessibility**: Screen reader compatibility
- **Responsive design**: Mobile/desktop layouts

### API Testing

When implementing tests, focus on:

- **Endpoint functionality**: Success and error cases
- **Security**: Rate limiting, timing guards, CORS
- **Input validation**: Required fields, data types
- **Integration**: Email delivery verification

### Example Test Structure

```javascript
// api/tests/contact.test.js
describe('Contact API', () => {
  describe('POST /contact', () => {
    it('should send email successfully with valid data', async () => {
      const response = await request(app)
        .post('/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message',
          timestamp: Date.now() - 5000
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    it('should reject requests failing timing guard', async () => {
      const response = await request(app)
        .post('/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com', 
          message: 'Test message',
          timestamp: Date.now() // Too recent
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('timing guard');
    });
  });
});
```

## Documentation Standards

### Code Documentation

- **JSDoc**: Use for complex functions
- **README**: Keep updated with new features
- **API docs**: Update when endpoints change
- **Comments**: Explain why, not what

### Example JSDoc

```javascript
/**
 * Processes contact form submission with security checks
 * @param {Object} contactData - Form data
 * @param {string} contactData.name - Visitor name
 * @param {string} contactData.email - Visitor email
 * @param {string} contactData.message - Contact message
 * @param {number} contactData.timestamp - Form submission timestamp
 * @returns {Promise<Object>} API response with success status
 * @throws {Error} When timing guard or rate limit fails
 */
const processContact = async (contactData) => {
  // Implementation
};
```

## Quality Gates

All contributions must pass these checks:

### Automated Guards

**Email String Validation:**
```bash
# Must not contain legacy domains
! grep -RInE '(vipspot\.us|gmail\.com|old@example\.com)' -- .

# Must contain current contact email
grep -RIn 'contact@vipspot.net' -- .
```

**Featured Pens Validation:**
```bash
# Must use canonical CodePen URLs with UTM tracking
grep -q 'codepen.io/CoderRvrse/pen/VYvNzzN.*utm_source' README.md
grep -q 'codepen.io/CoderRvrse/pen/azvxEZG.*utm_source' README.md
```

### Manual Review

- **Code quality**: Readable, maintainable code
- **Security**: No exposed secrets or credentials
- **Functionality**: Feature works as expected
- **Documentation**: Changes are properly documented

## Security Guidelines

### Never Commit

- API keys or secrets
- Environment files (`.env`)
- Personal information
- Temporary/debug files

### Security Best Practices

- **Input validation**: Sanitize all user inputs
- **Rate limiting**: Implement for all public endpoints
- **CORS**: Use strict origin whitelisting
- **Headers**: Include security headers
- **Timing**: Implement timing guards against bots

### Example Security Implementation

```javascript
// Input validation
const validateContactData = (data) => {
  const { name, email, message } = data;
  
  if (!name?.trim() || name.length > 100) {
    throw new Error('Invalid name');
  }
  
  if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error('Invalid email');
  }
  
  if (!message?.trim() || message.length > 1000) {
    throw new Error('Invalid message');
  }
};
```

## Release Process

### Versioning

VIPSpot uses date-based semantic versioning:

- **Major**: `vYYYY.MM.DD` (breaking changes)
- **Feature**: `vYYYY.MM.DD-feat` (new features)
- **Fix**: `vYYYY.MM.DD-fix` (bug fixes)
- **Docs**: `vYYYY.MM.DD-docs` (documentation)

### Automated Releases

Releases are automatically created when PRs are merged to `main`:

1. **Commit message** determines release type
2. **GitHub Actions** creates release and updates CHANGELOG
3. **Release notes** are generated from commit history
4. **Tags** are created automatically

### Manual Release

If needed, trigger manual release:

```bash
# Go to GitHub repository
# Actions → Release Management → Run workflow
# Select release type and run
```

## Getting Help

### Documentation

- **README.md**: Project overview and quick start
- **docs/**: Comprehensive documentation
- **API docs**: Endpoint reference
- **CLAUDE.md**: AI assistant guidance

### Communication

- **Issues**: Report bugs or request features
- **Discussions**: Ask questions or suggest improvements
- **Email**: contact@vipspot.net for urgent matters

### Code Review

- **PRs welcome**: We review all contributions
- **Feedback**: Constructive and helpful
- **Learning**: We're happy to help you improve

---

Thank you for contributing to VIPSpot! Your help makes this project better for everyone. 🚀