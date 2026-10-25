import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // GitHub Pages repository path. Change only if the deployment URL differs.
  base: '/cartorituals/'
});
