// Академгородок: 1 unit = 1 m. Планировка снята с карты (см. LAYOUT ниже):
// СУНЦ НГУ на Ляпунова 3, общежития и столовая севернее, учебно-оздоровительный
// центр, корпуса НГУ восточнее и главный корпус на юго-западе, улицы, сосновый
// лес, машины и фигурки людей.
//
// Здание ФМШ здесь — заглушка правильных пропорций. Модель из Blender кладётся
// в assets/models/fmsh.glb (ось X — длинная сторона, вход в +Z, начало координат
// на земле) и заменяет заглушку на загрузке.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FMSH_MODEL, CAMPUS_SIGN } from '../config.js';

// --- планировка по карте ----------------------------------------------------
//
// Координаты сняты со скриншота карты Академгородка (ул. Ляпунова 3, СУНЦ НГУ):
// масштаб ≈ 0,6 м на пиксель, начало координат — центр учебного корпуса ФМШ.
//
// Карта север-вверх, а в сцене север — это +X, восток — +Z (так учебный корпус
// остаётся вдоль X и входом в +Z, как ожидают биты камеры). Поэтому «высота»
// пятна на карте становится длиной L (вдоль X), а «ширина» — глубиной D. Дом,
// вытянутый на карте с запада на восток, ставится с rotY: π/2.
//
// Точность — «на глаз», ±10 м, зато у каждой записи есть подпись с карты:
// сверяться и править легко. Отступы дорог местами подтянуты, чтобы асфальт не
// лез в стены.

const DASH_STEP = 7.8;  // шаг прерывистой разметки
const LYAPUNOVA_Z = 42; // улица перед школой
const PIROGOVA_Z = 130; // улица восточнее, к корпусам НГУ

const LAYOUT = {
	buildings: [
		// СУНЦ НГУ, Ляпунова 3: два корпуса и переход между ними — на карте это
		// одно большое пятно с внутренними двориками.
		{
			id: 'fmsh', label: 'СУНЦ НГУ, учебный корпус', x: 0, z: 18,
			L: 114, D: 17, floors: 4, floorH: 3.5,
			wall: 0xcfc3a8, porch: true, sign: CAMPUS_SIGN,
		},
		{
			id: 'fmsh-back', label: 'СУНЦ НГУ, задний корпус', x: 0, z: -18,
			L: 114, D: 17, floors: 4, floorH: 3.5, wall: 0xcabea3,
		},
		{
			id: 'fmsh-link', label: 'СУНЦ НГУ, переход', x: 0, z: 0,
			L: 36, D: 16, floors: 4, floorH: 3.5, wall: 0xc6ba9f, rotY: Math.PI / 2,
		},
		{
			id: 'sunts-club', label: 'СУНЦ НГУ, клуб (4/3)', x: -10, z: -50,
			L: 67, D: 26, floors: 3, floorH: 3.4, wall: 0xc8c6d2,
		},

		// Общежития СУНЦ и столовая — севернее школы.
		{
			id: 'dorm-1', label: 'Общежитие СУНЦ НГУ', x: 170, z: -43,
			L: 96, D: 20, floors: 5, floorH: 3.1, wall: 0xc9b79b, porch: true,
		},
		{
			id: 'dorm-2', label: 'Общежитие СУНЦ НГУ', x: 93, z: -7,
			L: 72, D: 20, floors: 5, floorH: 3.1, wall: 0xc4b596, porch: true,
		},
		{
			id: 'canteen', label: 'Столовая НГУ', x: 136, z: -77,
			L: 44, D: 34, floors: 2, floorH: 4.0, wall: 0xd0c4a6,
		},

		// Северо-восток: учебно-оздоровительный центр и ещё два общежития.
		{
			id: 'wellness', label: 'Учебно-оздоровительный центр', x: 170, z: 119,
			L: 129, D: 40, floors: 3, floorH: 4.2, wall: 0xd2cdbe, rotY: Math.PI / 2,
		},
		{
			id: 'dorm-3', label: 'Общежитие (4)', x: 76, z: 144,
			L: 57, D: 24, floors: 5, floorH: 3.1, wall: 0xc9b79b, rotY: Math.PI / 2,
		},
		{
			id: 'dorm-4', label: 'Общежитие (6)', x: 51, z: 185,
			L: 47, D: 24, floors: 5, floorH: 3.1, wall: 0xc4b596, rotY: Math.PI / 2,
		},

		// Восток и юго-восток: корпуса НГУ.
		{
			id: 'nsu-research', label: 'НГУ, корпус', x: -21, z: 191,
			L: 150, D: 35, floors: 5, floorH: 3.6, wall: 0xc9c6bc, modern: true,
		},
		{
			id: 'nsu-new-a', label: 'НГУ, новый корпус (2А)', x: -123, z: 284,
			L: 231, D: 45, floors: 6, floorH: 3.7, wall: 0xd5d3cd,
			modern: true, rotY: Math.PI / 2, porch: true,
		},
		{
			id: 'nsu-new-b', label: 'НГУ, новый корпус (2А)', x: -243, z: 233,
			L: 120, D: 40, floors: 6, floorH: 3.7, wall: 0xd0cec8,
			modern: true, rotY: Math.PI / 2,
		},
		{
			id: 'lab', label: 'Лабораторный корпус', x: -138, z: 83,
			L: 78, D: 30, floors: 4, floorH: 3.6, wall: 0xc7bda8,
		},

		// Юго-запад: главный корпус НГУ и институтские корпуса.
		{
			id: 'nsu-main', label: 'НГУ, главный корпус', x: -303, z: -115,
			L: 129, D: 30, floors: 4, floorH: 3.8, wall: 0xd3c9b2,
			rotY: Math.PI / 2, porch: true,
		},
		{
			id: 'inst-1', label: 'Корпус 4/1', x: -156, z: -135,
			L: 63, D: 22, floors: 3, floorH: 3.5, wall: 0xc9c6d2, rotY: Math.PI / 2,
		},
		{
			id: 'inst-2', label: 'Корпус 4/2', x: -164, z: -36,
			L: 57, D: 22, floors: 3, floorH: 3.5, wall: 0xc6c4d0,
		},
		{
			id: 'inst-3', label: 'Корпус 1', x: -224, z: -49,
			L: 90, D: 24, floors: 3, floorH: 3.5, wall: 0xc9c6d2, rotY: Math.PI / 2,
		},
		{
			id: 'block-8', label: 'Дом 8', x: 183, z: -184,
			L: 78, D: 24, floors: 5, floorH: 3.0, wall: 0xcbbda2,
		},
	],
	// Дороги: центр, размер по X, размер по Z. dashed — осевая разметка,
	// rotY — поворот (для проспекта, идущего по карте под углом).
	roads: [
		{ x: 0, z: LYAPUNOVA_Z, w: 320, d: 10, dashed: true },  // ул. Ляпунова
		{ x: 10, z: PIROGOVA_Z, w: 220, d: 12, dashed: true },  // ул. Пирогова
		{ x: 108, z: 45, w: 10, d: 210 },                        // проезд к общежитиям
		{ x: -90, z: 30, w: 10, d: 260 },                        // проезд западнее школы
		{ x: 0, z: 35, w: 8, d: 16 },                            // подъезд к крыльцу
		{ x: -250, z: 330, w: 480, d: 20, rotY: -0.6, dashed: true }, // просп. Коптюга
	],
	// Замощённые площадки: парковки и площадь перед крыльцом.
	pads: [
		{ x: -60, z: 46, w: 34, d: 18 },   // парковка у школы
		{ x: -5, z: 204, w: 40, d: 26 },   // парковка «P» у корпусов НГУ
		{ x: 0, z: 31, w: 30, d: 6 },      // площадка перед крыльцом
	],
	/**
	 * Схематичные дома за лесом, слева и у горизонта: с воздуха видно, что
	 * Академгородок продолжается, а лес не висит в пустоте. Простые коробки —
	 * на таком удалении детали всё равно не читаются. h — высота в метрах.
	 */
	distant: [
		{ x: -700, z: -420, w: 82, d: 22, h: 18 },
		{ x: -560, z: -520, w: 92, d: 22, h: 30 },
		{ x: -250, z: -540, w: 44, d: 40, h: 25 },
		{ x: -430, z: -610, w: 72, d: 20, h: 26 },
		{ x: -645, z: -700, w: 26, d: 26, h: 44 },
		{ x: -330, z: -770, w: 112, d: 24, h: 22 },
		{ x: -520, z: -830, w: 62, d: 20, h: 34 },
		{ x: -800, z: -640, w: 68, d: 22, h: 28 },
		{ x: -180, z: -880, w: 86, d: 22, h: 20 },
	],
};

// --- небо, земля ------------------------------------------------------------

function groundTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const g = c.getContext('2d');
	g.fillStyle = '#6a7150';
	g.fillRect(0, 0, 512, 512);
	for (let i = 0; i < 900; i++) {
		const shade = 46 + Math.random() * 60;
		g.fillStyle = `rgba(${shade + 22},${shade + 28},${shade - 4},${0.25 + Math.random() * 0.4})`;
		g.beginPath();
		g.arc(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 22, 0, Math.PI * 2);
		g.fill();
	}
	const tex = new THREE.CanvasTexture(c);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(110, 110);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

const SKY_VERT = /* glsl */`
varying vec3 vWorld;
void main() {
	vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SKY_FRAG = /* glsl */`
uniform vec3 uTop, uHorizon, uSunColor; uniform vec3 uSunDir;
varying vec3 vWorld;
void main() {
	vec3 d = normalize(vWorld);
	float h = clamp(d.y * 1.4 + 0.08, 0.0, 1.0);
	vec3 c = mix(uHorizon, uTop, pow(h, 0.65));
	c += uSunColor * pow(max(dot(d, normalize(uSunDir)), 0.0), 24.0) * 0.5;
	gl_FragColor = vec4(c, 1.0);
}`;

/**
 * Небо, свёрнутое в карту окружения: без неё стёкла — чёрные дыры,
 * а с ней отражают небо, как настоящие.
 */
function skyEnvironment(renderer) {
	const c = document.createElement('canvas');
	c.width = 256; c.height = 128;
	const g = c.getContext('2d');
	const grad = g.createLinearGradient(0, 0, 0, 128);
	grad.addColorStop(0, '#5f86b8');
	grad.addColorStop(0.48, '#9fb6cf');
	grad.addColorStop(0.55, '#d8c096');
	grad.addColorStop(1, '#4b4530');
	g.fillStyle = grad;
	g.fillRect(0, 0, 256, 128);
	const tex = new THREE.CanvasTexture(c);
	tex.mapping = THREE.EquirectangularReflectionMapping;
	tex.colorSpace = THREE.SRGBColorSpace;
	const pmrem = new THREE.PMREMGenerator(renderer);
	const env = pmrem.fromEquirectangular(tex).texture;
	pmrem.dispose();
	tex.dispose();
	return env;
}

/** Вывеска над входом: светлые буквы на тёмно-красной табличке. */
function signTexture(text) {
	const c = document.createElement('canvas');
	c.width = 1024; c.height = 208;
	const g = c.getContext('2d');
	g.fillStyle = '#7a2d24';
	g.fillRect(0, 0, c.width, c.height);
	g.strokeStyle = '#f0e6d0';
	g.lineWidth = 4;
	g.strokeRect(10, 10, c.width - 20, c.height - 20);
	g.fillStyle = '#f4ecd8';
	g.font = '600 108px Georgia, "Times New Roman", serif';
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.fillText(text, c.width / 2, c.height / 2 + 6);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 8;
	return tex;
}

// --- здания -----------------------------------------------------------------

/**
 * Панельный корпус: плита, плинтус, межэтажные пояса, сетка окон, крыльцо.
 * Одной функцией собираются и школа, и общежития, и корпус НГУ — отличаются
 * размерами, числом этажей и остеклением.
 */
function slabBuilding(cfg) {
	const {
		L, D, floors, floorH = 3.5, wall = 0xcfc3a8,
		modern = false, porch = false,
	} = cfg;
	// Шаг окон ≈ 4 м (у современных корпусов 5 м), иначе пришлось бы задавать
	// число колонок руками для каждого дома.
	const cols = cfg.cols ?? Math.max(3, Math.round((L - 5) / (modern ? 5 : 4)));
	const H = floors * floorH;
	const group = new THREE.Group();

	const wallMat = new THREE.MeshStandardMaterial({ color: wall, roughness: 0.85 });
	const trimMat = new THREE.MeshStandardMaterial({
		color: modern ? 0xeeece6 : 0xa89b82, roughness: 0.9,
	});

	const slab = new THREE.Mesh(new THREE.BoxGeometry(L, H, D), wallMat);
	slab.position.y = H / 2;
	slab.castShadow = slab.receiveShadow = true;
	group.add(slab);

	const roof = new THREE.Mesh(
		new THREE.BoxGeometry(L + 1.2, 0.7, D + 1.2),
		new THREE.MeshStandardMaterial({ color: modern ? 0x9a9a94 : 0x8a8272, roughness: 0.9 }),
	);
	roof.position.y = H + 0.35;
	roof.castShadow = true;
	group.add(roof);

	const plinth = new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.8, D + 0.5), trimMat);
	plinth.position.y = 0.4;
	plinth.castShadow = plinth.receiveShadow = true;
	group.add(plinth);

	for (let f = 1; f < floors; f++) {
		const band = new THREE.Mesh(new THREE.BoxGeometry(L + 0.25, 0.35, D + 0.25), trimMat);
		band.position.y = f * floorH + 0.1;
		band.castShadow = band.receiveShadow = true;
		group.add(band);
	}

	// Угловые пилястры: ставить их глубже нельзя — закроют окна.
	for (const x of [-L / 2 + 0.35, L / 2 - 0.35]) {
		const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.7, H, D + 0.5), trimMat);
		pilaster.position.set(x, H / 2, 0);
		pilaster.castShadow = pilaster.receiveShadow = true;
		group.add(pilaster);
	}

	// Окна: один instanced mesh на оба длинных фасада. Цвет экземпляра
	// умножается на цвет материала, поэтому «обычное стекло» здесь белое.
	const winW = modern ? 2.9 : 2.4;
	const winH = modern ? 2.4 : 1.9;
	const winMat = new THREE.MeshStandardMaterial({
		color: 0x4d6373, roughness: 0.12, metalness: 0.55,
		emissive: 0x121e2b, emissiveIntensity: 1, side: THREE.DoubleSide,
	});
	const windows = new THREE.InstancedMesh(
		new THREE.PlaneGeometry(winW, winH), winMat, cols * floors * 2,
	);
	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const one = new THREE.Vector3(1, 1, 1);
	const lit = new THREE.Color(0xffd9a6);
	const plain = new THREE.Color(0xffffff);
	let i = 0;
	for (let side = 0; side < 2; side++) {
		const z = side === 0 ? D / 2 + 0.06 : -D / 2 - 0.06;
		q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), side === 0 ? 0 : Math.PI);
		for (let f = 0; f < floors; f++) {
			for (let cx = 0; cx < cols; cx++) {
				const x = -L / 2 + 2.6 + cx * ((L - 5.2) / (cols - 1));
				m.compose(new THREE.Vector3(x, winH / 2 + 0.95 + f * floorH, z), q, one);
				windows.setMatrixAt(i, m);
				windows.setColorAt(i, Math.random() < 0.18 ? lit : plain);
				i++;
			}
		}
	}
	windows.instanceMatrix.needsUpdate = true;
	if (windows.instanceColor) windows.instanceColor.needsUpdate = true;
	group.add(windows);

	if (porch) {
		const pw = Math.min(16, Math.max(7, L * 0.2));
		const canopy = new THREE.Mesh(new THREE.BoxGeometry(pw, 4.2, 5), trimMat);
		canopy.position.set(0, 2.1, D / 2 + 2.5);
		canopy.castShadow = canopy.receiveShadow = true;
		group.add(canopy);

		const steps = new THREE.Mesh(
			new THREE.BoxGeometry(pw - 2, 0.45, 3),
			new THREE.MeshStandardMaterial({ color: 0x9c9384, roughness: 0.95 }),
		);
		steps.position.set(0, 0.22, D / 2 + 6.2);
		steps.receiveShadow = true;
		group.add(steps);

		// Вход крупным планом виден в упор, поэтому это не одно тёмное пятно:
		// двустворчатая дверь с рамой, стеклянные боковины, вывеска.
		const face = D / 2 + 5.06;
		const frameMat = new THREE.MeshStandardMaterial({ color: 0x6d5f4a, roughness: 0.7 });
		const glassMat = new THREE.MeshStandardMaterial({
			color: 0x35434c, roughness: 0.12, metalness: 0.5,
		});
		const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.55 });

		for (const s of [-1, 1]) {
			const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.5, 0.08), leafMat);
			leaf.position.set(s * 0.62, 1.25, face);
			group.add(leaf);

			const sidelight = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), glassMat);
			sidelight.position.set(s * 2.6, 1.4, face - 0.02);
			group.add(sidelight);

			const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.7, 0.14), frameMat);
			mullion.position.set(s * 1.32, 1.35, face);
			group.add(mullion);
		}
		const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.18, 0.18), frameMat);
		lintel.position.set(0, 2.6, face);
		group.add(lintel);

		if (cfg.sign) {
			const sign = new THREE.Mesh(
				new THREE.PlaneGeometry(4.2, 0.85),
				new THREE.MeshStandardMaterial({ map: signTexture(cfg.sign), roughness: 0.8 }),
			);
			sign.position.set(0, 3.45, face);
			group.add(sign);
		}
	}

	group.position.set(cfg.x, 0, cfg.z);
	group.rotation.y = cfg.rotY ?? 0;
	return group;
}

// --- дороги -----------------------------------------------------------------

function roadNetwork() {
	const group = new THREE.Group();
	const asphalt = new THREE.MeshStandardMaterial({ color: 0x5b5750, roughness: 0.95 });
	const kerb = new THREE.MeshStandardMaterial({ color: 0x8f8b82, roughness: 0.9 });
	const markingMat = new THREE.MeshBasicMaterial({ color: 0xd8d2be });
	const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
	const one = new THREE.Vector3(1, 1, 1);
	const m = new THREE.Matrix4();

	for (const r of LAYOUT.roads) {
		const holder = new THREE.Group();
		holder.position.set(r.x, 0, r.z);
		holder.rotation.y = r.rotY ?? 0;
		group.add(holder);

		const road = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.12, r.d), asphalt);
		road.position.y = 0.06;
		road.receiveShadow = true;
		holder.add(road);

		// Тротуары по длинным сторонам.
		const alongZ = r.d > r.w;
		const off = alongZ ? r.w / 2 + 1.1 : r.d / 2 + 1.1;
		for (const side of [-1, 1]) {
			const walk = new THREE.Mesh(
				alongZ ? new THREE.BoxGeometry(2.2, 0.16, r.d) : new THREE.BoxGeometry(r.w, 0.16, 2.2),
				kerb,
			);
			walk.position.set(alongZ ? side * off : 0, 0.08, alongZ ? 0 : side * off);
			walk.receiveShadow = true;
			holder.add(walk);
		}

		if (!r.dashed) continue;
		const length = alongZ ? r.d : r.w;
		const count = Math.floor(length / DASH_STEP);
		// Плоскость лежит в XY, поэтому вдоль Z её длинная сторона — локальный Y.
		const dashes = new THREE.InstancedMesh(
			alongZ ? new THREE.PlaneGeometry(0.28, 3.2) : new THREE.PlaneGeometry(3.2, 0.28),
			markingMat, count,
		);
		for (let i = 0; i < count; i++) {
			const along = -length / 2 + DASH_STEP / 2 + i * DASH_STEP;
			m.compose(
				new THREE.Vector3(alongZ ? 0 : along, 0.13, alongZ ? along : 0),
				flat, one,
			);
			dashes.setMatrixAt(i, m);
		}
		dashes.instanceMatrix.needsUpdate = true;
		holder.add(dashes);
	}

	for (const a of LAYOUT.pads) {
		const pad = new THREE.Mesh(new THREE.BoxGeometry(a.w, 0.12, a.d), asphalt);
		pad.position.set(a.x, 0.06, a.z);
		pad.receiveShadow = true;
		group.add(pad);
	}

	return group;
}

/** Фасад для дальних домов: намёк на окна, одна текстура на всех. */
function distantFacadeTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const g = c.getContext('2d');
	g.fillStyle = '#9e9a8d';
	g.fillRect(0, 0, 64, 64);
	g.fillStyle = 'rgba(52,60,66,0.75)';
	for (let row = 0; row < 4; row++) {
		for (let col = 0; col < 4; col++) {
			g.fillRect(4 + col * 15, 5 + row * 16, 9, 8);
		}
	}
	const tex = new THREE.CanvasTexture(c);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

/** Дальние дома: коробка с плоской крышей, без тени — они вне её карты. */
function distantBlocks(blocks) {
	const group = new THREE.Group();
	const facade = distantFacadeTexture();
	const roofMat = new THREE.MeshStandardMaterial({ color: 0x716f68, roughness: 0.95 });

	for (const b of blocks) {
		const map = facade.clone();
		map.needsUpdate = true;
		// Один «этаж» текстуры ≈ 3 м, одно окно по горизонтали ≈ 4 м.
		map.repeat.set(Math.max(1, Math.round(b.w / 16)), Math.max(1, Math.round(b.h / 12)));
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(b.w, b.h, b.d),
			new THREE.MeshStandardMaterial({ map, roughness: 0.88 }),
		);
		box.position.set(b.x, b.h / 2, b.z);
		box.rotation.y = b.rotY ?? 0;
		group.add(box);

		const roof = new THREE.Mesh(new THREE.BoxGeometry(b.w + 1, 0.8, b.d + 1), roofMat);
		roof.position.set(b.x, b.h + 0.4, b.z);
		roof.rotation.y = b.rotY ?? 0;
		group.add(roof);
	}
	return group;
}

// --- лес --------------------------------------------------------------------

/** Сосна: высокий ствол и три яруса кроны — заметно живее одного конуса. */
function pineGeometries() {
	const trunk = new THREE.CylinderGeometry(0.3, 0.6, 17, 7);
	trunk.translate(0, 8.5, 0);
	const crown = mergeGeometries([
		new THREE.ConeGeometry(3.3, 7.0, 9).translate(0, 15.5, 0),
		new THREE.ConeGeometry(2.5, 6.0, 9).translate(0, 19.0, 0),
		new THREE.ConeGeometry(1.5, 4.6, 9).translate(0, 22.0, 0),
	]);
	return { trunk, crown };
}

/** Берёза: светлый ствол и рыхлая шарообразная крона. */
function birchGeometries() {
	const trunk = new THREE.CylinderGeometry(0.24, 0.38, 10, 6);
	trunk.translate(0, 5, 0);
	const crown = mergeGeometries([
		new THREE.IcosahedronGeometry(3.0, 1).translate(0, 11.5, 0),
		new THREE.IcosahedronGeometry(2.2, 1).translate(1.7, 9.2, 0.6),
		new THREE.IcosahedronGeometry(2.0, 1).translate(-1.5, 9.8, -0.8),
	]);
	return { trunk, crown };
}

/**
 * Лес вокруг кампуса. `blocked` не пускает деревья на дороги и в здания.
 * @param {(x: number, z: number) => boolean} blocked
 */
function forest(blocked, {
	pines = 1500, birches = 320, bushes = 700, spread = 900,
	minRadius = 0,   // дальний пояс сажаем только за этой границей
	shadows = true,  // за пределами карты теней она всё равно не работает
} = {}) {
	const group = new THREE.Group();
	const outside = (x, z) => Math.max(Math.abs(x), Math.abs(z)) < minRadius;

	const plant = (geos, materials, count, scaleRange, jitter) => {
		const trunks = new THREE.InstancedMesh(geos.trunk, materials.trunk, count);
		const crowns = new THREE.InstancedMesh(geos.crown, materials.crown, count);
		trunks.castShadow = crowns.castShadow = shadows;
		crowns.receiveShadow = shadows;

		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const axis = new THREE.Vector3(0, 1, 0);
		const scl = new THREE.Vector3();
		const pos = new THREE.Vector3();
		const tint = new THREE.Color();
		let placed = 0;
		let guard = 0;
		while (placed < count && guard++ < count * 40) {
			const x = (Math.random() - 0.5) * spread;
			const z = (Math.random() - 0.5) * spread;
			if (outside(x, z) || blocked(x, z)) continue;
			const s = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
			q.setFromAxisAngle(axis, Math.random() * Math.PI * 2);
			scl.set(s, s * (0.9 + Math.random() * 0.35), s);
			pos.set(x, 0, z);
			m.compose(pos, q, scl);
			trunks.setMatrixAt(placed, m);
			crowns.setMatrixAt(placed, m);
			// Разброс оттенка — иначе лес выглядит штампованным.
			tint.setHSL(
				jitter.h + (Math.random() - 0.5) * jitter.dh,
				jitter.s + (Math.random() - 0.5) * 0.12,
				jitter.l + (Math.random() - 0.5) * 0.14,
			);
			crowns.setColorAt(placed, tint);
			placed++;
		}
		trunks.count = crowns.count = placed;
		trunks.instanceMatrix.needsUpdate = crowns.instanceMatrix.needsUpdate = true;
		if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
		group.add(trunks, crowns);
	};

	plant(pineGeometries(), {
		trunk: new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 1 }),
		crown: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }),
	}, pines, [0.7, 1.25], { h: 0.28, dh: 0.05, s: 0.32, l: 0.24 });

	plant(birchGeometries(), {
		trunk: new THREE.MeshStandardMaterial({ color: 0xa9a294, roughness: 0.9 }),
		crown: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }),
	}, birches, [0.9, 1.35], { h: 0.25, dh: 0.03, s: 0.30, l: 0.30 });

	// Подлесок: кусты, чтобы стволы не росли из голой земли.
	const bushMesh = new THREE.InstancedMesh(
		new THREE.IcosahedronGeometry(1.5, 0),
		new THREE.MeshStandardMaterial({ color: 0x4c6136, roughness: 1, flatShading: true }),
		bushes,
	);
	bushMesh.castShadow = true;
	const bm = new THREE.Matrix4();
	const bq = new THREE.Quaternion();
	let placed = 0;
	let guard = 0;
	while (placed < bushes && guard++ < bushes * 40) {
		const x = (Math.random() - 0.5) * spread;
		const z = (Math.random() - 0.5) * spread;
		if (outside(x, z) || blocked(x, z)) continue;
		const s = 0.5 + Math.random() * 0.9;
		bq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI);
		bm.compose(new THREE.Vector3(x, s * 0.9, z), bq, new THREE.Vector3(s, s * 0.7, s));
		bushMesh.setMatrixAt(placed++, bm);
	}
	bushMesh.count = placed;
	bushMesh.instanceMatrix.needsUpdate = true;
	group.add(bushMesh);

	return group;
}

// --- машины, люди, фонари ---------------------------------------------------

const CAR_COLORS = [0xc9c2b0, 0x7e9bb5, 0x9c4b3c, 0xe0dccf, 0x6d7f68, 0x3f4a55, 0xb59b52];

/** Машины 70-х в самом общем виде: кузов, кабина, колёса. Статичные. */
function cars(spots) {
	const group = new THREE.Group();
	const n = spots.length;

	const body = new THREE.InstancedMesh(
		new THREE.BoxGeometry(4.4, 0.95, 1.85),
		new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.25 }),
		n,
	);
	const cabin = new THREE.InstancedMesh(
		new THREE.BoxGeometry(2.3, 0.75, 1.72),
		new THREE.MeshStandardMaterial({ color: 0x2d3b46, roughness: 0.1, metalness: 0.6 }),
		n,
	);
	const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 12);
	wheelGeo.rotateZ(Math.PI / 2);
	const wheels = new THREE.InstancedMesh(
		wheelGeo, new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.9 }), n * 4,
	);
	body.castShadow = cabin.castShadow = wheels.castShadow = true;

	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const axis = new THREE.Vector3(0, 1, 0);
	const one = new THREE.Vector3(1, 1, 1);
	const p = new THREE.Vector3();
	const off = new THREE.Vector3();
	const colour = new THREE.Color();

	spots.forEach((spot, i) => {
		q.setFromAxisAngle(axis, spot.rot);
		m.compose(p.set(spot.x, 0.72, spot.z), q, one);
		body.setMatrixAt(i, m);
		body.setColorAt(i, colour.setHex(CAR_COLORS[i % CAR_COLORS.length]));

		m.compose(
			p.set(spot.x, 1.55, spot.z).add(off.set(-0.35, 0, 0).applyQuaternion(q)),
			q, one,
		);
		cabin.setMatrixAt(i, m);

		let w = 0;
		for (const dx of [-1.45, 1.45]) {
			for (const dz of [-0.85, 0.85]) {
				m.compose(
					p.set(spot.x, 0.33, spot.z).add(off.set(dx, 0, dz).applyQuaternion(q)),
					q, one,
				);
				wheels.setMatrixAt(i * 4 + w++, m);
			}
		}
	});
	body.instanceMatrix.needsUpdate = true;
	cabin.instanceMatrix.needsUpdate = true;
	wheels.instanceMatrix.needsUpdate = true;
	if (body.instanceColor) body.instanceColor.needsUpdate = true;
	group.add(body, cabin, wheels);
	return group;
}

const COAT_COLORS = [0x8a3b2f, 0x2f4a6b, 0x6b5a3a, 0x3c4a3a, 0x7a6f8a, 0xb9ac91, 0x2b2b30];

/** Фигурки людей: макеты без анимации, зато масштаб сразу читается. */
function people(spots) {
	const group = new THREE.Group();
	const n = spots.length;

	const coatGeo = new THREE.CapsuleGeometry(0.21, 0.68, 4, 10);
	coatGeo.translate(0, 1.12, 0);
	const legsGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.78, 8);
	legsGeo.translate(0, 0.39, 0);
	const headGeo = new THREE.SphereGeometry(0.135, 12, 10);
	headGeo.translate(0, 1.66, 0);

	const coats = new THREE.InstancedMesh(
		coatGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }), n,
	);
	const legs = new THREE.InstancedMesh(
		legsGeo, new THREE.MeshStandardMaterial({ color: 0x2f3238, roughness: 0.9 }), n,
	);
	const heads = new THREE.InstancedMesh(
		headGeo, new THREE.MeshStandardMaterial({ color: 0xc99f7d, roughness: 0.8 }), n,
	);
	coats.castShadow = legs.castShadow = heads.castShadow = true;

	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const axis = new THREE.Vector3(0, 1, 0);
	const p = new THREE.Vector3();
	const scl = new THREE.Vector3();
	const colour = new THREE.Color();

	spots.forEach((spot, i) => {
		const s = spot.scale ?? (0.94 + Math.random() * 0.12); // взрослые и школьники
		q.setFromAxisAngle(axis, spot.rot ?? Math.random() * Math.PI * 2);
		m.compose(p.set(spot.x, 0, spot.z), q, scl.set(s, s, s));
		coats.setMatrixAt(i, m);
		legs.setMatrixAt(i, m);
		heads.setMatrixAt(i, m);
		coats.setColorAt(i, colour.setHex(COAT_COLORS[i % COAT_COLORS.length]));
	});
	coats.instanceMatrix.needsUpdate = true;
	legs.instanceMatrix.needsUpdate = true;
	heads.instanceMatrix.needsUpdate = true;
	if (coats.instanceColor) coats.instanceColor.needsUpdate = true;
	group.add(coats, legs, heads);
	return group;
}

/** Фонари вдоль улиц. */
function lampposts(positions) {
	const group = new THREE.Group();
	const n = positions.length;

	const poleGeo = new THREE.CylinderGeometry(0.11, 0.15, 8, 7);
	poleGeo.translate(0, 4, 0);
	const headGeo = new THREE.BoxGeometry(0.9, 0.22, 0.5);
	headGeo.translate(0.45, 8.05, 0);

	const poles = new THREE.InstancedMesh(
		poleGeo,
		new THREE.MeshStandardMaterial({ color: 0x6f7369, roughness: 0.7, metalness: 0.4 }),
		n,
	);
	const lamps = new THREE.InstancedMesh(
		headGeo,
		new THREE.MeshStandardMaterial({
			color: 0xfff2d4, emissive: 0xffe1a8, emissiveIntensity: 0.6, roughness: 0.5,
		}),
		n,
	);
	poles.castShadow = true;

	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const axis = new THREE.Vector3(0, 1, 0);
	const one = new THREE.Vector3(1, 1, 1);
	positions.forEach((pos, i) => {
		q.setFromAxisAngle(axis, pos.rot ?? 0);
		m.compose(new THREE.Vector3(pos.x, 0, pos.z), q, one);
		poles.setMatrixAt(i, m);
		lamps.setMatrixAt(i, m);
	});
	poles.instanceMatrix.needsUpdate = true;
	lamps.instanceMatrix.needsUpdate = true;
	group.add(poles, lamps);
	return group;
}

// --- сцена ------------------------------------------------------------------

/** Прямоугольники, куда нельзя сажать деревья: здания, дороги, парковка, двор. */
function buildBlocker() {
	const rects = [];
	const add = (x, z, w, d) => rects.push({
		x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2,
	});

	for (const b of LAYOUT.buildings) {
		const alongZ = Boolean(b.rotY);
		add(b.x, b.z, (alongZ ? b.D : b.L) + 16, (alongZ ? b.L : b.D) + 16);
	}
	for (const r of LAYOUT.roads) {
		const c = Math.abs(Math.cos(r.rotY ?? 0));
		const sn = Math.abs(Math.sin(r.rotY ?? 0));
		add(r.x, r.z, r.w * c + r.d * sn + 7, r.w * sn + r.d * c + 7);
	}
	for (const a of LAYOUT.pads) add(a.x, a.z, a.w + 6, a.d + 6);
	for (const b of LAYOUT.distant) add(b.x, b.z, b.w + 18, b.d + 18);
	add(0, 45, 60, 60);   // двор перед школой держим открытым
	add(0, 122, 44, 88); // коридор, по которому подлетает камера

	return (x, z) => rects.some((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
}

function carSpots() {
	const spots = [];
	// Парковка у школы и парковка «P» у корпусов НГУ — машины поперёк.
	for (const [px, pz, rows] of [[-60, 46, 5], [-5, 204, 6]]) {
		for (let row = 0; row < 2; row++) {
			for (let i = 0; i < rows; i++) {
				spots.push({ x: px - (rows - 1) * 2.8 + i * 5.6, z: pz + (row ? 5 : -5), rot: Math.PI / 2 });
			}
		}
	}
	// Вдоль улиц.
	for (const x of [-130, -70, -18, 46, 104]) spots.push({ x, z: LYAPUNOVA_Z - 3.2, rot: 0 });
	for (const x of [-100, 20, 88]) spots.push({ x, z: LYAPUNOVA_Z + 3.2, rot: Math.PI });
	for (const x of [-70, 10, 70]) spots.push({ x, z: PIROGOVA_Z - 3.6, rot: 0 });
	for (const x of [-40, 60]) spots.push({ x, z: PIROGOVA_Z + 3.6, rot: Math.PI });
	// У общежитий и столовой.
	for (const z of [-52, -34]) spots.push({ x: 108, z, rot: Math.PI / 2 });
	spots.push({ x: 136, z: -58, rot: 0 });
	return spots;
}

/** Люди: у крыльца, во дворе, на тротуарах, у общежитий и у НГУ. */
const PEOPLE_SPOTS = [
	// У крыльца школы и на площадке перед ним.
	{ x: -2.6, z: 30.5, rot: 0.4 }, { x: 1.8, z: 31.4, rot: -0.9 },
	{ x: 5.2, z: 33.0, rot: 2.6 }, { x: -6.4, z: 32.2, rot: 1.2 },
	{ x: 9.5, z: 30.0, rot: 3.0 }, { x: -12.0, z: 29.5, rot: 0.2 },
	// На тротуарах Ляпунова.
	{ x: 24.0, z: 36.0, rot: 1.4 }, { x: 31.0, z: 36.6, rot: 1.5 },
	{ x: -30.0, z: 36.2, rot: 4.6 }, { x: -46.0, z: 47.5, rot: 4.7 },
	{ x: 58.0, z: 47.4, rot: 1.7 },
	// У общежитий и столовой.
	{ x: 122.0, z: -31.0, rot: 0.8 }, { x: 126.0, z: -35.0, rot: 2.9 },
	{ x: 145.0, z: -30.5, rot: 1.1 }, { x: 96.0, z: 4.5, rot: 3.6 },
	{ x: 136.0, z: -57.0, rot: 2.0 }, { x: 140.0, z: -60.0, rot: 5.1 },
	// У корпусов НГУ.
	{ x: -21.0, z: 172.0, rot: 1.9 }, { x: -13.0, z: 174.0, rot: 2.1 },
	{ x: -30.0, z: 170.0, rot: 4.2 }, { x: -119.0, z: 260.0, rot: 1.6 },
	{ x: -112.0, z: 262.0, rot: 4.0 },
	// У лабораторного и клуба СУНЦ.
	{ x: -138.0, z: 100.0, rot: 2.4 }, { x: -14.0, z: -66.0, rot: 0.6 },
];

export function createCampusStage({ renderer } = {}) {
	const scene = new THREE.Scene();
	const sunDir = new THREE.Vector3(0.42, 0.55, 0.72).normalize();

	if (renderer) {
		scene.environment = skyEnvironment(renderer);
		scene.environmentIntensity = 0.55;
	}

	scene.fog = new THREE.FogExp2(0xcdba95, 0.00028);

	scene.add(new THREE.Mesh(
		new THREE.SphereGeometry(6000, 32, 24),
		new THREE.ShaderMaterial({
			uniforms: {
				uTop: { value: new THREE.Color(0x5f86b8) },
				uHorizon: { value: new THREE.Color(0xd8c096) },
				uSunColor: { value: new THREE.Color(0xffd9a0) },
				uSunDir: { value: sunDir },
			},
			vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
			side: THREE.BackSide, depthWrite: false, fog: false,
		}),
	));

	// Земля с запасом, чтобы её край не показался на горизонте.
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(9000, 9000),
		new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }),
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);

	scene.add(roadNetwork());
	scene.add(distantBlocks(LAYOUT.distant));

	const blocked = buildBlocker();
	scene.add(forest(blocked, { pines: 2100, birches: 420, bushes: 800, spread: 1250 }));
	// Дальний пояс: лес не обрывается по краю, а редеет к горизонту.
	scene.add(forest(blocked, {
		pines: 2600, birches: 280, bushes: 0,
		spread: 2600, minRadius: 620, shadows: false,
	}));

	// Части учебного корпуса помечены id, начинающимся с fmsh: модель из Blender
	// заменяет их все сразу.
	let fmshParts = [];
	for (const cfg of LAYOUT.buildings) {
		const building = slabBuilding(cfg);
		scene.add(building);
		if (cfg.id.startsWith('fmsh')) fmshParts.push(building);
	}

	new GLTFLoader().load(FMSH_MODEL, (gltf) => {
		gltf.scene.traverse((o) => {
			if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
		});
		for (const part of fmshParts) scene.remove(part);
		fmshParts = [gltf.scene];
		scene.add(gltf.scene);
		console.info('[campus] real ФМШ model loaded, placeholder removed');
	}, undefined, () => {
		console.info(`[campus] no ${FMSH_MODEL} yet — using the placeholder building`);
	});

	scene.add(cars(carSpots()));
	scene.add(people(PEOPLE_SPOTS));

	const lamps = [];
	for (let x = -155; x <= 155; x += 38) lamps.push({ x, z: LYAPUNOVA_Z + 7, rot: Math.PI });
	for (let x = -95; x <= 115; x += 42) lamps.push({ x, z: PIROGOVA_Z - 8, rot: 0 });
	scene.add(lampposts(lamps));

	const sun = new THREE.DirectionalLight(0xffe0b0, 3.4);
	sun.position.copy(sunDir).multiplyScalar(400);
	sun.castShadow = true;
	sun.shadow.mapSize.set(4096, 4096); // кампус стал шире — иначе тени только в центре
	sun.shadow.camera.left = -400;
	sun.shadow.camera.right = 400;
	sun.shadow.camera.top = 400;
	sun.shadow.camera.bottom = -400;
	sun.shadow.camera.near = 10;
	sun.shadow.camera.far = 900;
	sun.shadow.bias = -0.0006;
	scene.add(sun);
	scene.add(new THREE.HemisphereLight(0xbfd4f2, 0x55502f, 1.6));

	return {
		name: 'campus',
		scene,
		activate(camera) {
			camera.near = 0.4;
			camera.far = 8000;
			camera.updateProjectionMatrix();
		},
		update() {},
	};
}
