import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default {
	plugins: [sveltekit()],
	base: process.env.BASE_PATH || "/ZVL_IDS_Lab4", // ✅ Ensures GitHub Pages gets the correct repo name
  };
