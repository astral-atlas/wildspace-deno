
// @deno-types="vite-text"
import vertexShaderCode from './vertex.glsl?raw';
// @deno-types="vite-text"
import fragmentShaderCode from './fragment.glsl?raw';
import { three } from '../deps.ts';

export class SkyboxMaterial extends three.ShaderMaterial {
  constructor({ map }: { map: three.Texture }) {
    super({
      uniforms: {
        map: { value: map },
        u_resolution: { value: new three.Vector2(698, 512) }
      },
    
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode
    });
  }

  set map(map: three.Texture) {
    this.uniforms.map.value = map;
  }
}