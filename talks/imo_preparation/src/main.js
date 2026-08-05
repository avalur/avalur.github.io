import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { DEV, START_BEAT, STILL } from './config.js';
import { beats } from './beats.js';
import { Director } from './director.js';
import { Hud } from './hud.js';
import { RetroPass } from './retro.js';
import { dumpFree } from './camera_rig.js';
import { createEarthStage } from './scenes/earth.js';
import { createCampusStage } from './scenes/campus.js';
import { createClassroomStage } from './scenes/classroom.js';

if (STILL) document.body.classList.add('still');

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoft в r185 объявлен устаревшим

const cssRenderer = new CSS3DRenderer({ element: document.getElementById('css3d') });
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1e6);
const cssScene = new THREE.Scene();

const stages = {
	earth: createEarthStage(),
	campus: createCampusStage({ renderer }),
	classroom: createClassroomStage({ cssScene }),
};

const retro = new RetroPass(renderer);
const hud = new Hud(document.getElementById('hud'), { dev: DEV });
const director = new Director({ renderer, cssRenderer, camera, cssScene, stages, beats, hud, retro });

function resize() {
	const w = window.innerWidth;
	const h = window.innerHeight;
	renderer.setSize(w, h, false);
	cssRenderer.setSize(w, h);
	retro.setSize(w, h, renderer.getPixelRatio());
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// --- input ------------------------------------------------------------------

let orbitControls = null;

async function toggleOrbit() {
	if (!DEV) return;
	if (!orbitControls) {
		const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
		orbitControls = new OrbitControls(camera, renderer.domElement);
		orbitControls.enableDamping = true;
		director.orbit = orbitControls;
	}
	orbitControls.enabled = !orbitControls.enabled;
	if (orbitControls.enabled) {
		// Orbit around whatever we are looking at, roughly.
		const dist = director.stageName === 'earth' ? camera.position.length() * 0.4 : 8;
		orbitControls.target.copy(
			camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(dist).add(camera.position),
		);
	}
	hud.flash(orbitControls.enabled ? 'свободная камера: вкл' : 'свободная камера: выкл');
}

window.addEventListener('keydown', (e) => {
	if (e.metaKey || e.ctrlKey || e.altKey) return;
	switch (e.key) {
		case ' ': case 'ArrowRight': case 'PageDown': case 'Enter':
			director.next(); e.preventDefault(); break;
		case 'ArrowLeft': case 'PageUp': case 'Backspace':
			director.prev(); e.preventDefault(); break;
		case 'Home': director.goto(0, { instant: true }); break;
		case 'End': director.goto(beats.length - 1, { instant: true }); break;
		case 'r': case 'R':
			if (director.replay()) hud.flash('анимация заново');
			break;
		case 'h': case 'H': hud.toggleHelp(); break;
		case 'n': case 'N': hud.toggleNotes(); break;
		case 'f': case 'F':
			if (document.fullscreenElement) document.exitFullscreen();
			else document.documentElement.requestFullscreen();
			break;
		case 'o': case 'O': toggleOrbit(); break;
		case 'c': case 'C': {
			if (!DEV) break;
			const snippet = JSON.stringify(dumpFree(camera, director.stageName === 'earth' ? 1000 : 10));
			console.log(`cam: ${snippet},`);
			navigator.clipboard?.writeText(`cam: ${snippet},`).catch(() => {});
			hud.flash('позиция камеры скопирована');
			break;
		}
		default:
			if (/^[1-9]$/.test(e.key)) director.goto(Number(e.key) - 1);
	}
});

canvas.addEventListener('pointerdown', () => {
	if (!orbitControls?.enabled) director.next();
});

// --- go ---------------------------------------------------------------------

director.goto(START_BEAT, { instant: true });

const timer = new THREE.Timer(); // THREE.Clock в r185 объявлен устаревшим
let devTick = 0;

renderer.setAnimationLoop(() => {
	timer.update();
	const dt = Math.min(timer.getDelta(), 0.1); // survive tab switches
	director.update(dt);

	if (DEV && (devTick = (devTick + 1) % 15) === 0) {
		const s = director.camState;
		const where = s?.kind === 'geo'
			? `lat ${s.lat.toFixed(3)}  lon ${s.lon.toFixed(3)}  alt ${s.alt.toFixed(1)} км`
			: `pos ${s?.pos.map((v) => v.toFixed(1)).join(' ')}`;
		hud.setDev(`${director.stageName} · ${director.state} · ${where}`);
	}
});

if (DEV) {
	window.__talk = { director, stages, retro, camera, renderer };
	console.info('[talk] dev mode: window.__talk, "o" — свободная камера, "c" — скопировать позицию');
}
