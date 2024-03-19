import { UserConfig, Plugin } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [
    basicSsl({
      certDir: './certs'
    }),
  ],
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
    https: true,
    fs: {
      allow: ['..']
    }
  },
} as UserConfig;

