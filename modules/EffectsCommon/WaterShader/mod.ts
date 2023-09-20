
// @deno-types="vite-text"
import vertexShaderCode from './vertex.glsl?raw';
// @deno-types="vite-text"
import fragmentShaderCode from './fragment.glsl?raw';
import { three } from '../deps.ts';

export type WaterShaderProps = {
  time?: DOMHighResTimeStamp,
  color?: three.Color,
  depthColor?: three.Color,
  depthMultiplier?: number,
  waveSize?: number,
  waveFrequency?: number,
} & three.MaterialParameters

export class WaterShader extends three.ShaderMaterial {
  constructor({ time, color, depthColor, depthMultiplier, waveSize, waveFrequency, ...props }: WaterShaderProps = {}) {
    super({
      ...props,
      uniforms: {
        ...three.ShaderLib.basic.uniforms,
        time: { value: time },
        color: { value: color || new three.Color('red') },
        depthColor: { value: depthColor || new three.Color('black') },
        depthMultiplier: { value: depthMultiplier ?? 2 },
        waveSize: { value: waveSize || 1 },
        waveFrequency: { value: waveFrequency || 1 }
      },
    
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      fog: true,
    });
  }

  set time(time: number) {
    this.uniforms.time.value = time;
  }
  get time() {
    return this.uniforms.time.value;
  }

  set color(color: three.Color) {
    this.uniforms.color.value = color;
  }
  get color() {
    return this.uniforms.color.value;
  }

  set depthColor(depthColor: three.Color) {
    this.uniforms.depthColor.value = depthColor;
  }
  get depthColor() {
    return this.uniforms.depthColor.value;
  }

  set depthMultiplier(depthMultiplier: number) {
    this.uniforms.depthMultiplier.value = depthMultiplier;
  }
  get depthMultiplier() {
    return this.uniforms.depthMultiplier.value;
  }

  set waveSize(waveSize: number) {
    this.uniforms.waveSize.value = waveSize;
  }
  get waveSize() {
    return this.uniforms.waveSize.value;
  }

  set waveFrequency(waveFrequency: number) {
    this.uniforms.waveFrequency.value = waveFrequency;
  }
  get waveFrequency() {
    return this.uniforms.waveFrequency.value;
  }
}