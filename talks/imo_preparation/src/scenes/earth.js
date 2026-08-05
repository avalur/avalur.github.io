// The globe: 1 unit = 1 km, radius 6371, camera driven by {lat, lon, alt}.
//
// No map service, no tiles, no network: a textured sphere plus optional
// high-resolution patches glued on where we zoom in (see config.EARTH_PATCHES).

import * as THREE from 'three';
import { EARTH_RADIUS, TEXTURES, EARTH_PATCHES, SUN_OVER } from '../config.js';
import { geoToVector } from '../camera_rig.js';
import { createGeoTrace } from '../geo_trace.js';
import { OUTLINES } from '../data/outlines.js';

const DEG = Math.PI / 180;

/** Equirectangular starfield, generated once so nothing has to be downloaded. */
function makeStarfield() {
	const c = document.createElement('canvas');
	c.width = 2048; c.height = 1024;
	const g = c.getContext('2d');
	g.fillStyle = '#05060b';
	g.fillRect(0, 0, c.width, c.height);
	for (let i = 0; i < 9000; i++) {
		const x = Math.random() * c.width;
		const y = Math.random() * c.height;
		// Compensate for the equirectangular pinch at the poles.
		if (Math.random() > Math.sin((y / c.height) * Math.PI) * 0.9 + 0.1) continue;
		const r = Math.random() < 0.02 ? 1.1 : Math.random() * 0.55 + 0.15;
		const a = Math.random() * 0.6 + 0.2;
		g.fillStyle = `rgba(${230 + Math.random() * 25},${235 + Math.random() * 20},255,${a})`;
		g.beginPath();
		g.arc(x, y, r, 0, Math.PI * 2);
		g.fill();
	}
	const tex = new THREE.CanvasTexture(c);
	tex.mapping = THREE.EquirectangularReflectionMapping;
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

const NIGHT_VERT = /* glsl */`
varying vec2 vUv; varying vec3 vN;
void main() {
	vUv = uv;
	vN = normalize(mat3(modelMatrix) * normal);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NIGHT_FRAG = /* glsl */`
uniform sampler2D tLights; uniform vec3 uSun;
varying vec2 vUv; varying vec3 vN;
void main() {
	float night = smoothstep(0.10, -0.22, dot(vN, uSun));
	vec3 lights = texture2D(tLights, vUv).rgb;
	gl_FragColor = vec4(lights * night * 1.6, 1.0);
}`;

const GLOW_VERT = /* glsl */`
varying vec3 vN; varying vec3 vP;
void main() {
	vN = normalize(normalMatrix * normal);
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	vP = mv.xyz;
	gl_Position = projectionMatrix * mv;
}`;

// The (1 - rim^q) term drives the glow to zero exactly at the shell's
// silhouette, so the halo fades out instead of ending in a hard blue circle.
const GLOW_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uPower, uStrength;
varying vec3 vN; varying vec3 vP;
void main() {
	float rim = 1.0 - abs(dot(normalize(vN), normalize(-vP)));
	float f = pow(rim, uPower) * (1.0 - pow(rim, 14.0));
	gl_FragColor = vec4(uColor * f * uStrength, f);
}`;

/**
 * three's earth_specular map is "white = water". Used directly as a roughness
 * map that is backwards, and its JPEG blocks show up as square highlights along
 * the coasts. Invert it into a narrow roughness range instead: shiny ocean,
 * matte land, no visible blocking.
 */
function loadRoughnessFromSpecular(url, material) {
	const img = new Image();
	img.onload = () => {
		const c = document.createElement('canvas');
		c.width = img.width; c.height = img.height;
		const g = c.getContext('2d', { willReadFrequently: true });
		g.drawImage(img, 0, 0);
		const data = g.getImageData(0, 0, c.width, c.height);
		const px = data.data;
		for (let i = 0; i < px.length; i += 4) {
			// water (bright) → 0.42, land (dark) → 0.95
			const v = 242 - (px[i] / 255) * 135;
			px[i] = px[i + 1] = px[i + 2] = v;
			px[i + 3] = 255;
		}
		g.putImageData(data, 0, 0);
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.NoColorSpace;
		tex.anisotropy = 8;
		material.roughnessMap = tex;
		material.roughness = 1.0;
		material.needsUpdate = true;
	};
	img.onerror = () => console.warn(`[earth] texture missing: ${url}`);
	img.src = url;
}

/** Soft-edged mask so a patch dissolves into the globe instead of showing a seam. */
function featherMask() {
	const c = document.createElement('canvas');
	c.width = c.height = 256;
	const g = c.getContext('2d');
	g.fillStyle = '#000';
	g.fillRect(0, 0, 256, 256);
	const grad = g.createRadialGradient(128, 128, 60, 128, 128, 128);
	grad.addColorStop(0, '#fff');
	grad.addColorStop(0.72, '#fff');
	grad.addColorStop(1, '#000');
	g.fillStyle = grad;
	g.fillRect(0, 0, 256, 256);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.NoColorSpace;
	return tex;
}

/** A curved patch of imagery lying on the globe, so it never z-fights. */
function makePatchGeometry(lat, lon, spanKm, segments = 40) {
	const geo = new THREE.PlaneGeometry(1, 1, segments, segments);
	const pos = geo.attributes.position;
	const halfDeg = (spanKm / 2) / (EARTH_RADIUS * DEG); // degrees of arc per half-span
	const v = new THREE.Vector3();
	for (let i = 0; i < pos.count; i++) {
		const dLat = pos.getY(i) * 2 * halfDeg;
		const dLon = pos.getX(i) * 2 * halfDeg / Math.max(0.15, Math.cos(lat * DEG));
		// Приподняты совсем чуть-чуть: на низких высотах видимый зазор между
		// снимком и линиями контуров сразу бросается в глаза.
		geoToVector(lat + dLat, lon + dLon, EARTH_RADIUS + 0.2, v);
		pos.setXYZ(i, v.x, v.y, v.z);
	}
	geo.computeVertexNormals();
	return geo;
}

export function createEarthStage() {
	const scene = new THREE.Scene();
	scene.background = makeStarfield();

	const loader = new THREE.TextureLoader();
	const load = (url, colorSpace = THREE.SRGBColorSpace) => {
		const t = loader.load(url, undefined, undefined, () => {
			console.warn(`[earth] texture missing: ${url} — run assets/fetch_assets.sh`);
		});
		t.colorSpace = colorSpace;
		t.anisotropy = 8;
		return t;
	};

	const globeMat = new THREE.MeshStandardMaterial({
		map: load(TEXTURES.earthColor),
		normalMap: load(TEXTURES.earthNormal, THREE.NoColorSpace),
		normalScale: new THREE.Vector2(1.1, 1.1),
		roughness: 0.9,
		metalness: 0.0,
	});
	loadRoughnessFromSpecular(TEXTURES.earthSpecular, globeMat);
	const globe = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 256, 128), globeMat);
	scene.add(globe);

	const sunDir = geoToVector(SUN_OVER.lat, SUN_OVER.lon, 1).normalize();

	const nightMat = new THREE.ShaderMaterial({
		uniforms: { tLights: { value: load(TEXTURES.earthLights) }, uSun: { value: sunDir } },
		vertexShader: NIGHT_VERT,
		fragmentShader: NIGHT_FRAG,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
	});
	scene.add(new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.4, 128, 64), nightMat));

	// The clouds PNG is white-on-transparent: it has to go in `map` (which uses
	// the real alpha channel), not in `alphaMap` (which reads green and would
	// give hard-edged blocks).
	const clouds = new THREE.Mesh(
		new THREE.SphereGeometry(EARTH_RADIUS + 12, 128, 64),
		new THREE.MeshStandardMaterial({
			map: load(TEXTURES.earthClouds),
			transparent: true,
			opacity: 0.8,
			depthWrite: false,
			roughness: 1,
		}),
	);
	scene.add(clouds);

	const atmosphere = new THREE.Mesh(
		new THREE.SphereGeometry(EARTH_RADIUS * 1.06, 96, 48),
		new THREE.ShaderMaterial({
			uniforms: {
				uColor: { value: new THREE.Color(0x7db4ff) },
				uPower: { value: 2.6 },
				uStrength: { value: 0.85 },
			},
			vertexShader: GLOW_VERT,
			fragmentShader: GLOW_FRAG,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
		}),
	);
	scene.add(atmosphere);

	const sun = new THREE.DirectionalLight(0xfff3e0, 3.2);
	sun.position.copy(sunDir).multiplyScalar(EARTH_RADIUS * 30);
	scene.add(sun);
	scene.add(new THREE.HemisphereLight(0x334466, 0x0a0a12, 0.35));

	// --- обводки контуров -----------------------------------------------------
	const traces = OUTLINES.map((cfg) => {
		const trace = createGeoTrace(cfg);
		scene.add(trace.group);
		return { cfg, trace };
	});

	// --- optional high-res patches -------------------------------------------
	const feather = featherMask();
	const patches = EARTH_PATCHES.map((p) => {
		const mat = new THREE.MeshBasicMaterial({
			transparent: true, opacity: 0, depthWrite: false, alphaMap: feather,
		});
		mat.color.setScalar(p.gain ?? 1);
		const mesh = new THREE.Mesh(makePatchGeometry(p.lat, p.lon, p.spanKm), mat);
		mesh.visible = false;
		mesh.renderOrder = 2;
		loader.load(p.url, (tex) => {
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.anisotropy = 8;
			mat.map = tex;
			mat.needsUpdate = true;
			mesh.userData.ready = true;
		}, undefined, () => {
			console.info(`[earth] optional patch not found, skipping: ${p.url}`);
		});
		scene.add(mesh);
		return { cfg: p, mesh, mat };
	});

	return {
		name: 'earth',
		scene,

		activate(camera) {
			camera.fov = 50;
			camera.updateProjectionMatrix();
		},

		/**
		 * Какой бит сейчас на экране: контур показывается только на своём бите,
		 * остальные гаснут. Вызывается при входе в бит, до прибытия камеры.
		 */
		setActiveAction(name) {
			for (const { cfg, trace } of traces) trace.setActive(cfg.action === name);
		},

		/** Действия, которые бит запускает по прибытии камеры (см. beats.js). */
		action(name, { seek } = {}) {
			const found = traces.find((t) => t.cfg.action === name);
			if (!found) return;
			found.trace.start();
			if (seek != null) found.trace.seek(seek);
		},

		update({ dt, camState, camera }) {
			clouds.rotation.y += dt * 0.0035;

			const alt = camState?.alt ?? 20000;
			for (const { trace } of traces) trace.update(dt);

			// Keep the depth range tight around wherever we currently are.
			camera.near = THREE.MathUtils.clamp(alt * 0.02, 0.05, 200);
			camera.far = (alt + EARTH_RADIUS) * 2.6;
			camera.updateProjectionMatrix();

			for (const { cfg, mesh, mat } of patches) {
				if (!mesh.userData.ready) continue;
				const o = THREE.MathUtils.clamp(
					THREE.MathUtils.inverseLerp(cfg.fadeIn, cfg.fadeOut, alt), 0, 1,
				);
				mat.opacity = o;
				mesh.visible = o > 0.01;
			}
		},
	};
}
