import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  // Prevent vite from obscuring Rust errors
  clearScreen: false,
  server: {
    strictPort: true,
  },
})
