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
