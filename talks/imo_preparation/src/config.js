// Global knobs for the talk. Everything that a non-programmer might want to
// tweak between rehearsals should live here.

const params = new URLSearchParams(location.search);

/** ?dev — orbit controls, camera readout, "press C to copy camera state". */
export const DEV = params.has('dev');

/** ?beat=7 — jump straight to a beat. Handy when rehearsing one fragment. */
export const START_BEAT = Number.parseInt(params.get('beat') ?? '0', 10) || 0;

/** ?still — no slide entrance animations, for screenshots and printed stills. */
export const STILL = params.has('still');

/** ?seek=0.6 — прокрутить анимацию бита до этой доли (стоп-кадры, отладка). */
export const SEEK = params.has('seek') ? Number(params.get('seek')) : null;

/** Earth stage works in kilometres; 1 unit = 1 km. */
export const EARTH_RADIUS = 6371;

/** Campus and classroom stages work in metres; 1 unit = 1 m. */
export const PLACES = {
	// СУНЦ НГУ (ФМШ), ул. Ляпунова 3, Академгородок
	fmsh: { lat: 54.8419, lon: 83.0938, label: 'ФМШ' },
	novosibirsk: { lat: 55.0302, lon: 82.9204, label: 'Новосибирск' },
};

/**
 * Where the sun is. Given as a geographic point the sun is directly above,
 * so it is easy to reason about: this one gives Siberia a low afternoon light.
 */
export const SUN_OVER = { lat: 18, lon: 108 };

export const TEXTURES = {
	earthColor: './assets/textures/earth/earth_atmos_2048.jpg',
	earthNormal: './assets/textures/earth/earth_normal_2048.jpg',
	earthSpecular: './assets/textures/earth/earth_specular_2048.jpg',
	earthClouds: './assets/textures/earth/earth_clouds_1024.png',
	earthLights: './assets/textures/earth/earth_lights_2048.png',
};

/**
 * Optional high-resolution imagery patches glued onto the globe, so the deep
 * zoom does not turn into a blurry mess. Each patch is skipped silently if the
 * file is missing — see assets/README.md for how to produce them.
 */
export const EARTH_PATCHES = [
	{
		url: './assets/textures/earth/patch_siberia.jpg',
		lat: 56, lon: 84, spanKm: 1400,
		fadeIn: 9000, fadeOut: 1200, // altitude (km) where the patch appears / is fully opaque
		gain: 1.5,                   // satellite imagery is unlit, so brighten it by hand
	},
	{
		url: './assets/textures/earth/patch_novosibirsk.jpg',
		lat: 54.95, lon: 83.0, spanKm: 300,
		fadeIn: 1400, fadeOut: 250,
		gain: 3.0,                   // Siberian taiga in true colour is very dark
	},
];

/** Retro-70s look. Tweak live in ?dev mode via window.__retro.uniforms. */
export const LOOK = {
	exposure: 1.05,
	warm: 0.55, // 0 = neutral, 1 = heavy amber
	saturation: 0.88,
	vignette: 0.42,
	grain: 0.05,
};

/** Надпись на вывеске над входом в школу. */
export const CAMPUS_SIGN = 'СУНЦ НГУ';

/** Optional model of the real building, dropped in from Blender as glTF. */
export const FMSH_MODEL = './assets/models/fmsh.glb';
