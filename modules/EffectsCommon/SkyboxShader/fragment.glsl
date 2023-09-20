#include <common>
#include <fog_pars_fragment>

uniform highp sampler2D map;
uniform vec2 u_resolution;

void main() {
	vec2 st = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - (gl_FragCoord.y / u_resolution.y));
	gl_FragColor = texture(map, st);
	//gl_FragColor = vec4(st, 1.0, 1.0);

	#include <colorspace_fragment>
	#include <fog_fragment>
}
