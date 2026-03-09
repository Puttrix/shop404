import { defineConfig } from 'vitest/config';

// Vitest config for CMS E2E tests (smoke + extended).
// Uses a longer timeout because tests make real HTTP calls to a live CMS.
// Run via: npm run test:cms-smoke  or  npm run test:cms-e2e
export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 10_000,
  },
});
