#!/usr/bin/env node
/**
 * Shared Release Patterns for VIPSpot CI/CD
 * 
 * This module defines the exact commit type patterns and detection logic
 * used by both the release workflow and guard tests to prevent drift.
 */

// Commit types that trigger releases (in priority order)
export const RELEASE_TYPES = [
  'feat',      // Features -> v2025.MM.DD-feat
  'fix',       // Bug fixes -> v2025.MM.DD-fix  
  'docs',      // Documentation -> v2025.MM.DD-docs
  'chore',     // Maintenance -> v2025.MM.DD-chore
  'refactor'   // Code refactoring -> v2025.MM.DD-refactor
];

// Breaking change patterns that trigger major releases
export const MAJOR_PATTERNS = [
  /^feat(\(.*\))?!:\s/,           // feat!: breaking feature
  /^fix(\(.*\))?!:\s/,            // fix!: breaking fix
  /^refactor(\(.*\))?!:\s/,       // refactor!: breaking refactor
  /^BREAKING CHANGE:\s/           // BREAKING CHANGE: explicit
];

// Standard commit type patterns 
export const COMMIT_PATTERNS = {
  feat: /^feat(\(.*\))?:\s/,
  fix: /^fix(\(.*\))?:\s/,
  docs: /^docs(\(.*\))?:\s/,
  chore: /^chore(\(.*\))?:\s/,
  refactor: /^refactor(\(.*\))?:\s/
};

// Combined release trigger pattern (for bash regex)
export const RELEASE_REGEX_BASH = `^(${RELEASE_TYPES.join('|')})(\\(.*\\))?:\\s`;

// Combined release trigger pattern (for JavaScript)
export const RELEASE_REGEX_JS = new RegExp(RELEASE_REGEX_BASH);

// CodePen detection pattern (case-insensitive)
export const CODEPEN_PATTERN = /[Cc]ode[Pp]en/;

// Commit types that should NOT trigger releases
export const NON_RELEASE_TYPES = [
  'style',     // Code style changes
  'perf',      // Performance improvements  
  'test',      // Test changes
  'ci',        // CI/CD changes
  'build'      // Build system changes
];

/**
 * Determine release type from commit message
 */
export function getReleaseType(commitMessage) {
  // Check for breaking changes first (major)
  for (const pattern of MAJOR_PATTERNS) {
    if (pattern.test(commitMessage)) {
      return 'major';
    }
  }
  
  // Check standard commit types
  for (const [type, pattern] of Object.entries(COMMIT_PATTERNS)) {
    if (pattern.test(commitMessage)) {
      return type;
    }
  }
  
  // Default fallback
  return 'patch';
}

/**
 * Generate version tag based on release type
 */
export function generateVersionTag(releaseType, date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '.');
  
  switch (releaseType) {
    case 'major':
      return `v${dateStr}`;
    case 'feat':
      return `v${dateStr}-feat`;
    case 'fix':
      return `v${dateStr}-fix`;
    case 'docs':
      return `v${dateStr}-docs`;
    case 'chore':
      return `v${dateStr}-chore`;
    case 'refactor':
      return `v${dateStr}-refactor`;
    default:
      return `v${dateStr}-patch`;
  }
}

/**
 * Check if commit message mentions CodePen
 */
export function hasCodePenMention(commitMessage) {
  return CODEPEN_PATTERN.test(commitMessage);
}

/**
 * Test cases for validation
 */
export const TEST_CASES = {
  // Should trigger releases
  shouldMatch: [
    'feat: add back-to-top component',
    'feat(ui): enhance neon styling',
    'feat!: breaking API change',
    'fix: resolve parsing bug',
    'fix(ci): use heredoc pattern',
    'fix!: breaking security fix',
    'docs: update README badges',
    'docs(changelog): add release notes',
    'chore: clean up test files',
    'chore(deps): update packages (CodePen)',
    'refactor: simplify release logic',
    'refactor(workflow): extract helpers',
    'refactor!: breaking refactor',
    'BREAKING CHANGE: remove deprecated API'
  ],
  
  // Should NOT trigger releases  
  shouldNotMatch: [
    'style: fix linting issues',
    'perf: optimize animation performance',
    'test: add unit tests',
    'ci: update workflow permissions',
    'build: configure webpack',
    'wip: work in progress',
    'temp: temporary changes'
  ],
  
  // CodePen detection tests
  codepenTests: [
    { msg: 'chore: update deps (CodePen demo)', expected: true },
    { msg: 'feat: add animation with CodePen inspiration', expected: true },
    { msg: 'docs: link to codepen profile', expected: true },
    { msg: 'fix: standard bug fix', expected: false }
  ]
};

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const testMsg = process.argv[2];
  if (!testMsg) {
    console.log('Usage: node release-patterns.mjs "commit message"');
    console.log('');
    console.log('Example outputs:');
    console.log('  feat: new feature     -> feat');
    console.log('  fix!: breaking fix    -> major');  
    console.log('  style: lint fixes     -> patch');
    process.exit(1);
  }
  
  const releaseType = getReleaseType(testMsg);
  const versionTag = generateVersionTag(releaseType);
  const hasCodePen = hasCodePenMention(testMsg);
  
  console.log(JSON.stringify({
    message: testMsg,
    releaseType,
    versionTag,
    hasCodePen,
    triggersRelease: RELEASE_TYPES.includes(releaseType) || releaseType === 'major'
  }, null, 2));
}