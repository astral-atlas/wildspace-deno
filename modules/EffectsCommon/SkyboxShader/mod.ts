
// @deno-types="vite-text"
import vertexShaderCode from './vertex.glsl?raw';
// @deno-types="vite-text"
import fragmentShaderCode from './fragment.glsl?raw';
import { three } from '../deps.ts';

export type SkyboxMaterialProps = {
  map: null | three.Texture,
  name?: string,
  resolution?: three.Vector2
}

export class SkyboxMaterial extends three.ShaderMaterial {
  constructor({ map, name, resolution }: SkyboxMaterialProps) {
    super({
      name,
      uniforms: {
        ...three.ShaderLib.basic.uniforms,
        map: { value: map },
        u_resolution: { value: resolution || new three.Vector2(698, 512) },
      },
    
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      fog: true
    });
  }

  set map(map: three.Texture) {
    this.uniforms.map.value = map;
  }
  get map() {
    return this.uniforms.map.value;
  }

  set resolution(map: three.Vector2) {
    this.uniforms.u_resolution.value = map;
  }
  get resolution() {
    return this.uniforms.u_resolution.value;
  }
}