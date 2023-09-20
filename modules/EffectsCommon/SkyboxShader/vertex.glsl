#include <common>
#include <fog_pars_vertex>

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}