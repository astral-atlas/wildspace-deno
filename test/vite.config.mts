import { defineConfig } from 'npm:vite@3.2.4';
import denoResolve from '/Users/lkaalim/Projects/lukekaalim/vite_plugin_deno_resolve/mod.ts';

export default defineConfig({
  plugins: [denoResolve()],
});

