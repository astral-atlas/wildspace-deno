import { UserConfig, Plugin, defineConfig } from "vite";

export default defineConfig({
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
});


