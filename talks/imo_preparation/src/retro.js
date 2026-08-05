// One hand-rolled post-processing pass: warm grade + grain + vignette + fade.
//
// Deliberately not EffectComposer — a single fullscreen quad keeps the vendored
// dependency list to three files and the shader readable.

import * as THREE from 'three';
import { LOOK } from './config.js';

const FRAG = /* glsl */`
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime, uExposure, uWarm, uSaturation, uVignette, uGrain, uFade;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main() {
	vec3 c = texture2D(tDiffuse, vUv).rgb * uExposure;

	// Desaturate a touch, then push everything towards amber and lift the
	// blacks so shadows go warm-brown instead of pure black — that is most of
	// what reads as "shot on film in 1975".
	float l = dot(c, vec3(0.299, 0.587, 0.114));
	c = mix(vec3(l), c, uSaturation);
	c *= mix(vec3(1.0), vec3(1.10, 1.00, 0.86), uWarm);
	c += vec3(0.030, 0.018, 0.006) * uWarm * (1.0 - l);

	float d = length(vUv - 0.5);
	c *= 1.0 - uVignette * smoothstep(0.32, 0.86, d);

	c += (hash(vUv * uResolution + fract(uTime) * vec2(37.0, 17.0)) - 0.5) * uGrain;

	gl_FragColor = vec4(mix(c, vec3(0.0), uFade), 1.0);
}`;

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export class RetroPass {
	constructor(renderer) {
		this.renderer = renderer;
		this.target = new THREE.WebGLRenderTarget(1, 1, {
			samples: 4, // MSAA, since we lose the default framebuffer's antialiasing
			type: THREE.HalfFloatType,
			colorSpace: THREE.SRGBColorSpace,
		});
		this.uniforms = {
			tDiffuse: { value: this.target.texture },
			uResolution: { value: new THREE.Vector2(1, 1) },
			uTime: { value: 0 },
			uExposure: { value: LOOK.exposure },
			uWarm: { value: LOOK.warm },
			uSaturation: { value: LOOK.saturation },
			uVignette: { value: LOOK.vignette },
			uGrain: { value: LOOK.grain },
			uFade: { value: 0 },
		};
		this.quad = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false }),
		);
		this.quad.frustumCulled = false;
		this.quadScene = new THREE.Scene().add(this.quad);
		this.quadCamera = new THREE.Camera();
	}

	setSize(width, height, pixelRatio) {
		const w = Math.floor(width * pixelRatio);
		const h = Math.floor(height * pixelRatio);
		this.target.setSize(w, h);
		this.uniforms.uResolution.value.set(w, h);
	}

	set fade(v) { this.uniforms.uFade.value = v; }
	get fade() { return this.uniforms.uFade.value; }

	render(scene, camera, elapsed) {
		this.uniforms.uTime.value = elapsed;
		this.renderer.setRenderTarget(this.target);
		this.renderer.render(scene, camera);
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.quadScene, this.quadCamera);
	}
}
