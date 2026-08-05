// Camera states and how to interpolate between them.
//
// Two kinds of state:
//   geo  — {lat, lon, alt, heading, pitch}   used on the globe (alt in km)
//   free — {pos:[x,y,z], target:[x,y,z], fov} used in campus/classroom (metres)
//
// Interpolating altitude logarithmically is what makes a "Google Earth" flight
// feel right: linear interpolation crawls at the top and slams into the ground.

import * as THREE from 'three';
import { EARTH_RADIUS } from './config.js';

const DEG = Math.PI / 180;

export const easeInOut = (t) => t * t * t * (t * (t * 6 - 15) + 10); // smootherstep

/** Point on a sphere of the given radius, in the same frame as the globe mesh. */
export function geoToVector(lat, lon, radius = EARTH_RADIUS, out = new THREE.Vector3()) {
	const phi = (90 - lat) * DEG;
	const theta = (lon + 180) * DEG;
	return out.set(
		-radius * Math.sin(phi) * Math.cos(theta),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta),
	);
}

/** Local up/north/east frame at a geographic point. */
export function geoFrame(lat, lon) {
	const up = geoToVector(lat, lon, 1).normalize();
	const east = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), up);
	if (east.lengthSq() < 1e-8) east.set(1, 0, 0); // at the poles pick something stable
	east.normalize();
	const north = new THREE.Vector3().crossVectors(up, east).normalize();
	return { up, north, east };
}

const _dir = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _look = new THREE.Vector3();

/** Place the camera according to a geo state. */
export function applyGeo(camera, s) {
	const { up, north, east } = geoFrame(s.lat, s.lon);
	const pitch = (s.pitch ?? -90) * DEG;
	const heading = (s.heading ?? 0) * DEG;

	// Horizontal forward direction: heading 0 = north, 90 = east.
	_fwd.copy(north).multiplyScalar(Math.cos(heading))
		.addScaledVector(east, Math.sin(heading)).normalize();

	_dir.copy(_fwd).multiplyScalar(Math.cos(pitch)).addScaledVector(up, Math.sin(pitch)).normalize();

	camera.position.copy(up).multiplyScalar(EARTH_RADIUS + s.alt);
	// Looking straight down, "up on screen" must be the horizontal heading.
	camera.up.copy(Math.abs(s.pitch ?? -90) > 82 ? _fwd : up);
	camera.lookAt(_look.copy(camera.position).add(_dir));
	if (s.fov) { camera.fov = s.fov; camera.updateProjectionMatrix(); }
}

/** Place the camera according to a free state. */
export function applyFree(camera, s) {
	camera.up.set(0, 1, 0);
	camera.position.set(s.pos[0], s.pos[1], s.pos[2]);
	camera.lookAt(s.target[0], s.target[1], s.target[2]);
	const fov = s.fov ?? 45;
	if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

export function applyCam(camera, s) {
	if (s.kind === 'geo') applyGeo(camera, s); else applyFree(camera, s);
}

const shortestAngle = (a, b) => a + ((((b - a) % 360) + 540) % 360) - 180;
const lerp = (a, b, t) => a + (b - a) * t;
const logLerp = (a, b, t) => Math.exp(lerp(Math.log(Math.max(a, 1e-4)), Math.log(Math.max(b, 1e-4)), t));

/** Interpolate two states of the same kind. */
export function lerpCam(a, b, t) {
	if (a.kind !== b.kind) return t < 0.5 ? a : b; // cross-stage cuts go through a fade
	if (a.kind === 'geo') {
		return {
			kind: 'geo',
			lat: lerp(a.lat, b.lat, t),
			lon: lerp(a.lon, shortestAngle(a.lon, b.lon), t),
			alt: logLerp(a.alt, b.alt, t),
			heading: lerp(a.heading ?? 0, shortestAngle(a.heading ?? 0, b.heading ?? 0), t),
			pitch: lerp(a.pitch ?? -90, b.pitch ?? -90, t),
			fov: lerp(a.fov ?? 50, b.fov ?? 50, t),
		};
	}
	return {
		kind: 'free',
		pos: [0, 1, 2].map((i) => lerp(a.pos[i], b.pos[i], t)),
		target: [0, 1, 2].map((i) => lerp(a.target[i], b.target[i], t)),
		fov: lerp(a.fov ?? 45, b.fov ?? 45, t),
	};
}

/** Read the current camera back as a free state — used by the ?dev camera dump. */
export function dumpFree(camera, distance = 10) {
	const target = camera.getWorldDirection(new THREE.Vector3())
		.multiplyScalar(distance).add(camera.position);
	const r = (v) => Math.round(v * 100) / 100;
	return {
		kind: 'free',
		pos: [r(camera.position.x), r(camera.position.y), r(camera.position.z)],
		target: [r(target.x), r(target.y), r(target.z)],
		fov: camera.fov,
	};
}
