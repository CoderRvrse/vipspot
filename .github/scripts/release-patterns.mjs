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
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2);
  const flag = args[0];
  
  // Self-test mode
  if (flag === '--self-test') {
    console.log('🧪 Running comprehensive self-test...');
    console.log('');
    
    const testSuites = [
      {
        name: '✅ Release Triggers',
        tests: TEST_CASES.shouldMatch,
        expectedTrigger: true
      },
      {
        name: '🚫 Non-Release Commits', 
        tests: TEST_CASES.shouldNotMatch,
        expectedTrigger: false
      }
    ];
    
    let totalPassed = 0;
    let totalTests = 0;
    
    for (const suite of testSuites) {
      console.log(`### ${suite.name}`);
      
      for (const msg of suite.tests) {
        const releaseType = getReleaseType(msg);
        const versionTag = generateVersionTag(releaseType);
        const hasCodePen = hasCodePenMention(msg);
        const triggersRelease = RELEASE_TYPES.includes(releaseType) || releaseType === 'major';
        
        const passed = triggersRelease === suite.expectedTrigger;
        const status = passed ? '✓' : '❌';
        const codepenIcon = hasCodePen ? ' 🎨' : '';
        
        console.log(`  ${status} "${msg}"`);
        console.log(`    → ${releaseType} → ${versionTag}${codepenIcon}`);
        
        if (!passed) {
          console.log(`    ❌ Expected trigger: ${suite.expectedTrigger}, got: ${triggersRelease}`);
          process.exit(1);
        }
        
        totalPassed++;
        totalTests++;
      }
      console.log('');
    }
    
    // Test CodePen detection specifically
    console.log('### 🎨 CodePen Detection');
    for (const { msg, expected } of TEST_CASES.codepenTests) {
      const detected = hasCodePenMention(msg);
      const status = detected === expected ? '✓' : '❌';
      const icon = detected ? ' 🎨' : '';
      
      console.log(`  ${status} "${msg}"${icon}`);
      
      if (detected !== expected) {
        console.log(`    ❌ Expected: ${expected}, got: ${detected}`);
        process.exit(1);
      }
      
      totalPassed++;
      totalTests++;
    }
    
    console.log('');
    console.log(`🎉 All ${totalPassed}/${totalTests} tests passed!`);
    console.log('✅ Release pattern matrix is working correctly');
    process.exit(0);
  }
  
  // Regular usage
  const testMsg = flag;
  if (!testMsg) {
    console.log('Usage: node release-patterns.mjs "commit message"');
    console.log('       node release-patterns.mjs --self-test');
    console.log('');
    console.log('Examples:');
    console.log('  feat: new feature     -> feat');
    console.log('  feat!: breaking fix   -> major');  
    console.log('  style: lint fixes     -> patch');
    console.log('  chore: deps (CodePen) -> chore + CodePen');
    console.log('');
    console.log('Self-test validates all known commit patterns and edge cases.');
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