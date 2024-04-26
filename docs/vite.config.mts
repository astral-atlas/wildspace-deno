import { UserConfig, Plugin, defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ['../modules/**.ts']
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
});


