#include <common>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform float waveSize;
uniform float waveFrequency;
varying float depth;

void main() {
	float xWave = sin(((time * 4.0) + position.x) / 4.0 * waveFrequency)/10.0;
	float xBigWave = sin(((time * 10.0) + position.x) / 8.0 * waveFrequency)/3.0;
	float zWave = sin(((time * 2.0) + position.z) / 8.0 * waveFrequency)/10.0;

	depth = xWave + zWave + xBigWave;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(
		position.x,
		position.y + (depth * waveSize),
		position.z,
		1.0
	);
}