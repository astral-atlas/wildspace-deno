varying float depth;
uniform float depthMultiplier;
uniform vec3 color;
uniform vec3 depthColor;


void main() {
	gl_FragColor = vec4(color + (depthColor * depth * depthMultiplier), 1.0);

	gl_FragColor = linearToOutputTexel( gl_FragColor );
}
