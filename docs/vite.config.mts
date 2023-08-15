export default {
  build: {
    sourcemap: true
  },
  assetsInclude: [
    '**/*.md',
    '**/*.gltf',
    '**/*.glb',
  ],
  server: {
    fs: {
      allow: ['..']
    }
  }
};
