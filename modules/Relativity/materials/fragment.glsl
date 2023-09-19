uniform highp sampler2D map;

uniform vec2 u_resolution;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	gl_FragColor = texture(map, st);
}
