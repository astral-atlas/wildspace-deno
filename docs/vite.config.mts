import denoResolve from '/Users/lkaalim/Projects/lukekaalim/vite_plugin_deno_resolve/mod.ts';

export default {
  build: {
    sourcemap: true
  },
  assetsInclude: [
    '**/*.md',
    '**/*.gltf',
    '**/*.glb',
    '**/*.PNG',
  ],
  server: {
    fs: {
      allow: ['..']
    }
  },
};
