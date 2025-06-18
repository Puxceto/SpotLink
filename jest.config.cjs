module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: ['/tests/e2e/'],
};
