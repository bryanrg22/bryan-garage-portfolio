import { defineConfig } from 'vitest/config'

// Unit tests run in plain Node — they cover pure logic (physics math, world
// state, data integrity), not rendering. The 3D scene itself is exercised by
// the Playwright smoke test in e2e/.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
