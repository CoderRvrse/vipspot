/**
 * Commitlint Configuration for VIPSpot
 * 
 * Enforces consistent commit messages that align with our release patterns.
 * Uses the same commit types defined in .github/scripts/release-patterns.mjs
 */

// Import release types from our shared patterns (for consistency)
const RELEASE_TYPES = ['feat', 'fix', 'docs', 'chore', 'refactor'];

// Additional conventional commit types that don't trigger releases
const NON_RELEASE_TYPES = ['style', 'perf', 'test', 'ci', 'build'];

// All valid commit types
const ALL_TYPES = [...RELEASE_TYPES, ...NON_RELEASE_TYPES];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Enforce our exact type list (matches release-patterns.mjs)
    'type-enum': [2, 'always', ALL_TYPES],
    
    // Case rules
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    
    // Length rules
    'header-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    'subject-max-length': [2, 'always', 80],
    
    // Format rules
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-empty': [2, 'never'],
    
    // Custom rules for VIPSpot
    'scope-case': [2, 'always', 'lower-case'],
    'header-trim': [2, 'always'],
    
    // Breaking change rules
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
  
  // Custom parser options
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(\(.+\))?!?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
      breakingHeaderPattern: /^(\w*)(\(.+\))?!: (.+)$/,
    },
  },
  
  // Custom plugins for enhanced validation
  plugins: [
    {
      rules: {
        // Custom rule: warn about CodePen mentions for visibility
        'codepen-awareness': (parsed) => {
          const codepenRegex = /[Cc]ode[Pp]en/;
          const hasCodePen = codepenRegex.test(parsed.raw);
          
          if (hasCodePen) {
            return [
              true, 
              `🎨 CodePen mention detected! This commit will include CodePen showcase sections in release notes.`
            ];
          }
          
          return [true];
        },
        
        // Custom rule: validate breaking changes
        'breaking-change-format': (parsed) => {
          const isBreaking = parsed.header?.includes('!:') || 
                           parsed.body?.includes('BREAKING CHANGE:') ||
                           parsed.footer?.includes('BREAKING CHANGE:');
          
          if (isBreaking) {
            return [
              true,
              `💥 Breaking change detected! This will create a major release (v2025.MM.DD).`
            ];
          }
          
          return [true];
        },
        
        // Custom rule: release type awareness
        'release-awareness': (parsed) => {
          const type = parsed.type;
          
          if (RELEASE_TYPES.includes(type)) {
            return [
              true,
              `🚀 Release commit detected! Type '${type}' will trigger a v2025.MM.DD-${type} release.`
            ];
          } else if (NON_RELEASE_TYPES.includes(type)) {
            return [
              true,
              `📝 Non-release commit. Type '${type}' will not trigger an automatic release.`
            ];
          }
          
          return [true];
        }
      }
    }
  ],
  
  // Apply our custom rules
  rules: {
    ...module.exports.rules,
    'codepen-awareness': [1, 'always'],
    'breaking-change-format': [1, 'always'], 
    'release-awareness': [1, 'always']
  },
  
  // Help text for developers
  helpUrl: 'https://github.com/CoderRvrse/vipspot#contributing',
  
  // Ignore merge commits and other automated commits
  ignores: [
    (commit) => commit.includes('Merge'),
    (commit) => commit.includes('chore(release): update CHANGELOG'),
    (commit) => /^Revert /.test(commit),
  ],
  
  // Default to error level for validation
  defaultIgnores: true,
  
  // Custom formatter for better error messages
  formatter: '@commitlint/format'
};