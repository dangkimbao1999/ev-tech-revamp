import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

// Aliases mirror tsconfig "paths" (declared here because test files are excluded from tsconfig).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@payload-config': path.resolve('src/payload.config.ts'),
      '@': path.resolve('src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
