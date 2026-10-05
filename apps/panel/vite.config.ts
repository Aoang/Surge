import { resolve } from 'node:path'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: process.env.SURGE_OUTPUT_DIR
      ? resolve(process.env.SURGE_OUTPUT_DIR)
      : resolve(import.meta.dirname, '../../output'),
    emptyOutDir: false,
  },
})
