// A ФМШ classroom: 1 unit = 1 m. Blackboard on the -Z wall, desks facing it.
//
// Окна — на левой от учеников стене (−X). Это не вкусовщина: СанПиН требует
// левостороннее естественное освещение, чтобы правая рука не бросала тень на
// тетрадь. Ученик смотрит в −Z, значит его левая рука — это −X.
// Правая стена (+X) свободна, на ней висят плакаты-стенды.
//
// Слайды и плакаты — настоящий HTML в слое CSS3D.

import * as THREE from 'three';
import { createSlideDeck, PANEL_SLIDES } from '../slides/slides.js';

const W = 11;   // width  (x)
const D = 9;    // depth  (z)
const H = 3.5;  // height (y)

function wall(w, h, color, roughness = 0.92) {
	return new THREE.Mesh(
		new THREE.PlaneGeometry(w, h),
		new THREE.MeshStandardMaterial({ color, roughness, side: THREE.DoubleSide }),
	);
}

function desks() {
	const group = new THREE.Group();
	const topMat = new THREE.MeshStandardMaterial({ color: 0xb07a45, roughness: 0.55 });
	const legMat = new THREE.MeshStandardMaterial({ color: 0x2f3a36, roughness: 0.6, metalness: 0.4 });
	const rows = 4, perRow = 3;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < perRow; c++) {
			const x = (c - (perRow - 1) / 2) * 3.1;
			const z = -1.6 + r * 1.75;
			const desk = new THREE.Group();
			const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.62), topMat);
			top.position.y = 0.74;
			top.castShadow = top.receiveShadow = true;
			desk.add(top);
			const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.34), topMat);
			bench.position.set(0, 0.45, 0.62);
			bench.castShadow = true;
			desk.add(bench);
			for (const [lx, lz] of [[-1.05, -0.22], [1.05, -0.22], [-1.05, 0.7], [1.05, 0.7]]) {
				const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.74, 0.05), legMat);
				leg.position.set(lx, 0.37, lz);
				desk.add(leg);
			}
			desk.position.set(x, 0, z);
			desk.rotation.y = (Math.random() - 0.5) * 0.05; // nobody aligns desks perfectly
			group.add(desk);
		}
	}
	return group;
}

export function createClassroomStage({ cssScene }) {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x2a2620);

	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(W, D),
		new THREE.MeshStandardMaterial({ color: 0x7a5236, roughness: 0.75 }),
	);
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	const ceiling = new THREE.Mesh(
		new THREE.PlaneGeometry(W, D),
		new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 1 }),
	);
	ceiling.rotation.x = Math.PI / 2;
	ceiling.position.y = H;
	scene.add(ceiling);

	const paint = 0xd9d3bd;
	const front = wall(W, H, paint); front.position.set(0, H / 2, -D / 2); scene.add(front);
	const back = wall(W, H, paint); back.position.set(0, H / 2, D / 2); back.rotation.y = Math.PI; scene.add(back);
	// Стена с окнами стоит против света, поэтому она чуть темнее.
	const left = wall(D, H, 0xcfc9b2); left.position.set(-W / 2, H / 2, 0); left.rotation.y = Math.PI / 2; scene.add(left);
	const right = wall(D, H, paint); right.position.set(W / 2, H / 2, 0); right.rotation.y = -Math.PI / 2; scene.add(right);

	// Windows on the -X wall: bright panes framed by thin bars (a solid frame
	// box would simply hide the pane behind it).
	const paneMat = new THREE.MeshBasicMaterial({ color: 0xfff6e2 });
	const frameMat = new THREE.MeshStandardMaterial({ color: 0xefe9d8, roughness: 0.8 });
	for (let i = 0; i < 3; i++) {
		const z = -2.4 + i * 2.4;
		const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.8), paneMat);
		pane.position.set(-W / 2 + 0.02, 1.85, z);
		pane.rotation.y = Math.PI / 2;
		scene.add(pane);

		const bars = [
			[0.09, 2.0, 0.12, 1.85, z - 0.99], // left
			[0.09, 2.0, 0.12, 1.85, z + 0.99], // right
			[0.09, 0.12, 2.1, 2.81, z],        // top
			[0.09, 0.12, 2.1, 0.89, z],        // bottom
			[0.07, 1.9, 0.07, 1.85, z],        // central mullion
		];
		for (const [dx, dy, dz, y, bz] of bars) {
			const bar = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), frameMat);
			bar.position.set(-W / 2 + 0.07, y, bz);
			scene.add(bar);
		}
	}

	// Blackboard. Proportions follow the 16:9 slides: a 4:10 board would let a
	// slide hang over its top and bottom edges.
	const BOARD_Y = 1.95;
	const boardGroup = new THREE.Group();
	const board = new THREE.Mesh(
		new THREE.PlaneGeometry(5.0, 2.85),
		new THREE.MeshStandardMaterial({ color: 0x1d2b23, roughness: 0.55 }),
	);
	const boardZ = -D / 2 + 0.05;
	board.position.set(0, BOARD_Y, boardZ);
	boardGroup.add(board);
	const boardFrame = new THREE.Mesh(
		new THREE.BoxGeometry(5.3, 3.05, 0.08),
		new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.7 }),
	);
	boardFrame.position.set(0, BOARD_Y, boardZ - 0.04);
	boardGroup.add(boardFrame);
	const tray = new THREE.Mesh(
		new THREE.BoxGeometry(5.3, 0.06, 0.16),
		new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.7 }),
	);
	tray.position.set(0, BOARD_Y - 1.62, boardZ + 0.07);
	boardGroup.add(tray);
	scene.add(boardGroup);

	// The slides themselves: HTML in the CSS3D layer, sitting on the board.
	const deck = createSlideDeck(4.7);
	const cssRoot = new THREE.Group();
	deck.object.position.set(0, BOARD_Y, boardZ + 0.03);
	cssRoot.add(deck.object);
	cssScene.add(cssRoot);

	// Картины и плакаты на правой стене (+X). Рама с подложкой в 3D, а сам
	// «слайд» живёт в слое CSS3D чуть впереди подложки. Ширина, пропорции,
	// положение по z и стартовый слайд — здесь; содержание — в PANEL_SLIDES.
	//
	// У каждой картины свои пропорции — по снимку, который в ней висит, иначе
	// его резало бы: слева выпускной планшет 1977 года (2500 × 1855), справа
	// скриншот страницы «Совёнка» (1505 × 964). canvasWidth правой картины равен
	// ширине файла: текста на скриншоте много и он мелкий, при 800 px он бы
	// сначала сжался, а потом растянулся обратно объективом.
	const PANELS = [
		{ z: -2.25, width: 2.6, aspect: 2500 / 1855, slide: 0, canvasWidth: 800 },
		{ z: 1.6, width: 2.6, aspect: 1505 / 964, slide: 1, canvasWidth: 1505 },
	];
	const PANEL_Y = 1.78;
	const panelFrameMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.7 });
	const panelBackMat = new THREE.MeshStandardMaterial({ color: 0xe4d9bb, roughness: 0.9 });
	const panels = PANELS.map(({ z, width, aspect, slide, canvasWidth }) => {
		const height = width / aspect;
		const frame = new THREE.Mesh(
			new THREE.BoxGeometry(0.06, height + 0.14, width + 0.14),
			panelFrameMat,
		);
		frame.position.set(W / 2 - 0.03, PANEL_Y, z);
		scene.add(frame);
		// Подложка на случай, если CSS3D не отрисуется (или смотрим совсем сбоку):
		// на стене всё равно висит стенд, а не дырка.
		const backing = new THREE.Mesh(new THREE.PlaneGeometry(width, height), panelBackMat);
		backing.position.set(W / 2 - 0.07, PANEL_Y, z);
		backing.rotation.y = -Math.PI / 2;
		scene.add(backing);

		const panelDeck = createSlideDeck(width, {
			slides: PANEL_SLIDES,
			canvasWidth,
			aspect,
			start: slide,
		});
		panelDeck.object.position.set(W / 2 - 0.09, PANEL_Y, z);
		panelDeck.object.rotation.y = -Math.PI / 2;
		cssRoot.add(panelDeck.object);
		return panelDeck;
	});

	// Все HTML-поверхности комнаты — доска и картины (см. update).
	const cssSurfaces = [deck.object, ...panels.map((p) => p.object)];
	const forward = new THREE.Vector3();
	const toSurface = new THREE.Vector3();

	scene.add(desks());

	const teacherDesk = new THREE.Mesh(
		new THREE.BoxGeometry(1.8, 0.75, 0.7),
		new THREE.MeshStandardMaterial({ color: 0x8d6239, roughness: 0.7 }),
	);
	teacherDesk.position.set(-3.0, 0.38, -2.9);
	teacherDesk.castShadow = teacherDesk.receiveShadow = true;
	scene.add(teacherDesk);

	// Daylight through the windows (теперь слева) плюс warm ceiling fixtures.
	const daylight = new THREE.DirectionalLight(0xfff0d2, 2.6);
	daylight.position.set(-14, 7, 2);
	daylight.target.position.set(2, 1, -1);
	daylight.castShadow = true;
	daylight.shadow.mapSize.set(1024, 1024);
	daylight.shadow.camera.left = -9;
	daylight.shadow.camera.right = 9;
	daylight.shadow.camera.top = 7;
	daylight.shadow.camera.bottom = -3;
	daylight.shadow.camera.near = 1;
	daylight.shadow.camera.far = 40;
	daylight.shadow.bias = -0.0009;
	scene.add(daylight, daylight.target);
	scene.add(new THREE.HemisphereLight(0xf3e6c8, 0x5a4531, 1.1));
	for (const z of [-2.2, 1.6]) {
		// A visible fixture plus a soft light hung a little below the ceiling,
		// so the ceiling gets a gentle pool instead of a hard hot spot.
		const bulb = new THREE.PointLight(0xffe4b5, 3.2, 14, 2);
		bulb.position.set(0, H - 0.55, z);
		scene.add(bulb);
		const fixture = new THREE.Mesh(
			new THREE.CylinderGeometry(0.42, 0.34, 0.1, 24),
			new THREE.MeshBasicMaterial({ color: 0xfff0cf }),
		);
		fixture.position.set(0, H - 0.12, z);
		scene.add(fixture);
	}

	return {
		name: 'classroom',
		scene,
		cssRoot,
		setSlide: deck.setSlide,
		slideCount: deck.count,
		/**
		 * Плакаты на правой стене. `beat.panels = [1, 2]` — по индексу в
		 * PANEL_SLIDES на каждый стенд; null оставляет стенд как есть.
		 */
		setPanels(list) {
			list.forEach((slide, i) => {
				if (slide !== null && slide !== undefined) panels[i]?.setSlide(slide);
			});
		},
		activate(camera) {
			camera.near = 0.1;
			camera.far = 120;
			camera.updateProjectionMatrix();
		},
		update({ camera }) {
			// CSS3D ничем не перекрывается и не отсекается по камере: поверхность,
			// оказавшаяся у нас за спиной, вылезает через полкадра зеркальным
			// пятном. Поэтому гасим всё, что не впереди объектива.
			camera.getWorldDirection(forward);
			for (const surface of cssSurfaces) {
				toSurface.subVectors(surface.position, camera.position);
				surface.visible = toSurface.dot(forward) > 0.15;
			}
		},
	};
}
