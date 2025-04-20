import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'build'  // 👈 matches the GitHub Actions workflow
  }
});
