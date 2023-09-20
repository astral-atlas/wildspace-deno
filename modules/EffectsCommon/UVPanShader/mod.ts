
// @deno-types="vite-text"
import vertexShaderCode from './vertex.glsl?raw';
// @deno-types="vite-text"
import fragmentShaderCode from './fragment.glsl?raw';
import { three } from '../deps.ts';

export type UVPanShaderProps = {
  map: null | three.Texture,
  velocity: three.Vector2,
  time?: DOMHighResTimeStamp,
} & three.MaterialParameters

export class UVPanShader extends three.ShaderMaterial {
  constructor({ map, time, velocity, ...props }: UVPanShaderProps) {
    super({
      ...props,
      uniforms: {
        ...three.ShaderLib.basic.uniforms,
        map: { value: map },
        time: { value: time },
        velocity: { value: velocity },
      },
    
      vertexShader: vertexShaderCode,
      fragmentShader: three.ShaderLib.basic.fragmentShader,
      fog: true,
    });
  }

  set map(map: three.Texture) {
    this.uniforms.map.value = map;
  }
  get map() {
    return this.uniforms.map.value;
  }

  set time(time: number) {
    this.uniforms.time.value = time;
  }
  get time() {
    return this.uniforms.time.value;
  }
}