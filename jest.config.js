/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module format
  preset: 'default',
  extensionsToTreatAsEsm: ['.js'],
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'js/**/*.js',
    'scripts/**/*.mjs',
    '!js/**/*.min.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Transform configuration
  transform: {},
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Silent on warnings
  silent: false
};

export default config;