import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    alias: { '@': root },
  },
})
