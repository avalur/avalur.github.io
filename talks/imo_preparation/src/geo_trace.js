// Замкнутый контур на глобусе, который рисуется бегущей точкой — как трек в Strava.
//
// Труба (TubeGeometry) вдоль сплайна по сфере плюс спрайт-точка на конце. Показ
// управляется одной uniform-переменной uProgress: фрагменты, до которых линия
// ещё «не дошла», отбрасываются, а у самого края добавляется свечение.
//
// Контур принадлежит своему биту: он появляется, только когда бит становится
// текущим (setActive), и мягко гаснет при уходе с бита — на других высотах и в
// других кадрах его не видно.

import * as THREE from 'three';
import { EARTH_RADIUS } from './config.js';
import { geoToVector } from './camera_rig.js';

const TRACE_VERT = /* glsl */`
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const TRACE_FRAG = /* glsl */`
uniform float uProgress, uOpacity;
uniform vec3 uColor, uHeadColor;
varying vec2 vUv;
void main() {
	float behind = uProgress - vUv.x;
	if (behind < 0.0) discard;
	// Раскалённый участок сразу за точкой, дальше — ровная линия.
	vec3 c = mix(uColor, uHeadColor, exp(-behind * 55.0));
	gl_FragColor = vec4(c, uOpacity);
}`;

/** Спрайт бегущей точки: мягкое радиальное пятно, нарисованное в canvas. */
function dotTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const g = c.getContext('2d');
	const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
	grad.addColorStop(0.0, 'rgba(255,255,255,1)');
	grad.addColorStop(0.22, 'rgba(255,233,170,0.95)');
	grad.addColorStop(0.5, 'rgba(255,182,84,0.45)');
	grad.addColorStop(1.0, 'rgba(255,170,60,0)');
	g.fillStyle = grad;
	g.fillRect(0, 0, 128, 128);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

const smoothstep = (t) => t * t * (3 - 2 * t);
const DOT_FADE = 0.7;   // секунды, за которые точка гаснет на замкнутом круге
const LEAVE_FADE = 0.6; // секунды, за которые контур гаснет при уходе с бита

/**
 * @param {Array<[number, number]>} points [широта, долгота], контур замыкается
 * @param {number} altKm высота линии над поверхностью
 * @param {number} thicknessKm радиус трубы (см. правило в data/outlines.js)
 * @param {number} duration секунды на полный обход контура
 */
export function createGeoTrace({
	points,
	altKm = 26,
	thicknessKm = 17,
	duration = 5.5,
	color = 0xffb545,
	headColor = 0xfff4d6,
	dotKm = 280,
	segments = 1400,
}) {
	const group = new THREE.Group();
	group.visible = false;

	const curve = new THREE.CatmullRomCurve3(
		points.map(([lat, lon]) => geoToVector(lat, lon, EARTH_RADIUS + altKm)),
		true, 'catmullrom', 0.4,
	);

	const material = new THREE.ShaderMaterial({
		uniforms: {
			uProgress: { value: 0 },
			uOpacity: { value: 1 },
			uColor: { value: new THREE.Color(color) },
			uHeadColor: { value: new THREE.Color(headColor) },
		},
		vertexShader: TRACE_VERT,
		fragmentShader: TRACE_FRAG,
		transparent: true,
	});
	const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, thicknessKm, 8, true), material);
	tube.renderOrder = 4; // поверх снимков-патчей (renderOrder 2)
	group.add(tube);

	const dot = new THREE.Sprite(new THREE.SpriteMaterial({
		map: dotTexture(),
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
	}));
	dot.scale.setScalar(dotKm);
	dot.renderOrder = 5;
	dot.visible = false;
	group.add(dot);

	let elapsed = 0;
	let running = false;
	let progress = 0;
	let dotFade = -1;   // ≥0 — круг замкнулся, точка гаснет
	let dotOpacity = 1;
	let active = false;
	let visible = 0;    // 1 на своём бите, 0 вне него

	// TubeGeometry раскладывает вершины по длине дуги (getPointAt), а не по
	// параметру сплайна — точку надо считать так же, иначе она уедет от линии.
	function place(t) {
		dot.position.copy(curve.getPointAt(THREE.MathUtils.clamp(t, 0, 1)));
	}

	function apply() {
		material.uniforms.uOpacity.value = visible;
		dot.material.opacity = visible * dotOpacity;
		group.visible = visible > 0.01 && progress > 0;
	}

	function reset() {
		elapsed = 0;
		progress = 0;
		running = false;
		dotFade = -1;
		dotOpacity = 1;
		material.uniforms.uProgress.value = 0;
		dot.visible = false;
		apply();
	}

	function advance(dt) {
		if (!active && visible > 0) {
			visible = Math.max(0, visible - dt / LEAVE_FADE);
			apply();
			if (visible === 0) reset(); // ушли с бита — в следующий раз с нуля
			return;
		}

		if (dotFade >= 0) {
			dotFade += dt;
			dotOpacity = Math.max(0, 1 - dotFade / DOT_FADE);
			apply();
			if (dotOpacity <= 0) { dot.visible = false; dotFade = -1; }
			return;
		}
		if (!running) return;

		elapsed += dt;
		const t = Math.min(1, elapsed / duration);
		progress = smoothstep(t); // мягкий старт и мягкий приезд в точку старта
		material.uniforms.uProgress.value = progress;
		place(progress);
		apply();
		if (t >= 1) {
			running = false;
			dotFade = 0;
		}
	}

	return {
		group,

		/** Контур принадлежит текущему биту или нет. */
		setActive(value) {
			if (value === active) return;
			active = value;
			if (value) { visible = 1; apply(); }
		},

		/** Начать (или повторить) отрисовку с нуля. */
		start() {
			reset();
			running = true;
			dot.visible = true;
			place(0);
			apply();
		},

		/** Перемотать на долю 0…1 — для стоп-кадров (?seek=0.6). */
		seek(fraction) {
			elapsed = THREE.MathUtils.clamp(fraction, 0, 1) * duration;
			running = true;
			dotFade = -1;
			dotOpacity = 1;
			advance(0);
		},

		update: advance,
	};
}
