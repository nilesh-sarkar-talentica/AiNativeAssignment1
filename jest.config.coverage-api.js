const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom config for API coverage testing
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/api/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/tests/integration/api/**/*.(test|spec).(ts|tsx|js)',
  ],
  // Only collect coverage from API route files
  collectCoverageFrom: [
    'src/app/api/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  transformIgnorePatterns: ['node_modules/(?!(bson|mongodb|mongoose|@?uuid)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  preset: undefined,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

module.exports = createJestConfig(config)
