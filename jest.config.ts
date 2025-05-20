import type { Config } from 'jest';
import nextJest from 'next/jest';
import './env.config.ts';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],

  preset: 'ts-jest',
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  rootDir: '.',
  roots: ['<rootDir>/src/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/src/__mocks__/styleMock.ts',
    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': `<rootDir>/src/__mocks__/fileMock.ts`,

    // Handle module aliases
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',

    // Handle @next/font
    '@next/font/(.*)': `<rootDir>/src/__mocks__/nextFontMock.ts`,
    // Handle next/font
    'next/font/(.*)': `<rootDir>/src/__mocks__/nextFontMock.ts`,
    // Disable server-only
    'server-only': `<rootDir>/src/__mocks__/empty.js`,
  },
  modulePathIgnorePatterns: ['/\\.next/'],
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: ['/next[/\\\\]dist/', '/\\.next/', '/node_modules/'],

  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  transform: {
    '^.+\\.(t|j)sx?$': '<rootDir>/node_modules/babel-jest',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default createJestConfig(config);
