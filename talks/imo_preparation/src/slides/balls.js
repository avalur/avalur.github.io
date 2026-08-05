// Заголовок из точек: белые точки лежат по контуру букв, рядом с курсором
// каждая рассыпается на семь радужных осколков, те разлетаются и пружиной
// возвращаются на место.
//
// Портировано со страницы avalur.me/balls (src/pages/balls.astro): физика и
// константы те же. Отличий два, и оба — из-за того, что слайд живёт в 3D-сцене:
//
// 1. Мышь приходит из окна, а не из самого канваса. Слой CSS3D для мыши закрыт
//    (pointer-events: none), иначе клик по слайду не долетал бы до канваса
//    доклада и доклад перестал бы листаться. Экранные координаты переводятся в
//    координаты слайда по getBoundingClientRect() — на этом бите камера стоит
//    строго по нормали к доске, поэтому перевод линейный.
// 2. Размер шрифта не фиксирован: заголовок вписывается в отведённую коробку,
//    холст слайда всего 1280 px шириной, и длинная строка иначе выходит за край.

const RAINBOW = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0080ff', '#4b0082', '#9400d3'];
const N = RAINBOW.length; // семь осколков на точку

const STEP = 6;          // шаг сетки точек, px
const DOT_R = 1.9;       // радиус точки, px
const REPEL_R = 46;      // радиус влияния курсора, px
const REPEL_FORCE = 4200;
const SPRING = 0.05;     // возврат к своему месту
const FRICTION = 0.86;   // затухание скорости
const SPEED_MIN = 280;   // разброс начальной скорости осколка, px/с
const SPEED_MAX = 720;
const REST_DISP = 0.6;   // «дома» — ближе этого к своему месту…
const REST_VEL = 1.2;    // …и медленнее этого

/**
 * @param {HTMLCanvasElement} canvas холст во весь слайд (position: absolute)
 * @param {object} opts
 * @param {string} opts.text строка заголовка
 * @param {HTMLElement} opts.box пустой блок в потоке слайда — в него и вписываем
 *   заголовок, чтобы вёрстка жила в CSS, а не в двух местах сразу
 * @returns {() => void} остановить анимацию и отписаться от мыши
 */
export function initBalls(canvas, opts) {
	let stop = null;
	let raf = 0;
	// Слайд может быть ещё не в документе: CSS3DRenderer вешает свои элементы на
	// страницу только в первом кадре, а бит успевает смениться раньше — при
	// заходе сразу на ?beat=16, например. Пока холст не измеряется, ждём кадр.
	const boot = () => {
		if (canvas.clientWidth && canvas.clientHeight) stop = start(canvas, opts);
		else raf = requestAnimationFrame(boot);
	};
	boot();
	return () => {
		cancelAnimationFrame(raf);
		stop?.();
	};
}

function start(canvas, { text, box }) {
	const W = canvas.clientWidth;
	const H = canvas.clientHeight;

	// Холст слайда — 1280×720 «бумажных» пикселей, но на экране его растягивает
	// объектив, поэтому точки рисуем с запасом ×2, иначе они мылятся.
	const SS = 2;
	const ctx = canvas.getContext('2d');
	canvas.width = W * SS;
	canvas.height = H * SS;
	ctx.setTransform(SS, 0, 0, SS, 0, 0);

	const anchors = buildAnchors(text, box, W, H);
	const mouse = { x: -9999, y: -9999, active: false };

	function onMove(ev) {
		const r = canvas.getBoundingClientRect();
		if (!r.width || !r.height) return;
		mouse.x = ((ev.clientX - r.left) / r.width) * W;
		mouse.y = ((ev.clientY - r.top) / r.height) * H;
		mouse.active = true;
	}
	function onLeave() {
		mouse.active = false;
		mouse.x = mouse.y = -9999;
	}
	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerdown', onMove);
	window.addEventListener('pointerleave', onLeave);

	let raf = 0;
	let last = performance.now();
	function frame(now) {
		const dt = Math.min(0.033, (now - last) / 1000);
		last = now;
		ctx.clearRect(0, 0, W, H);
		for (const a of anchors) step(ctx, a, mouse, dt);
		raf = requestAnimationFrame(frame);
	}
	raf = requestAnimationFrame(frame);

	return () => {
		cancelAnimationFrame(raf);
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerdown', onMove);
		window.removeEventListener('pointerleave', onLeave);
	};
}

/** Текст → сетка точек: рисуем строку в невидимый холст и снимаем непрозрачные пиксели. */
function buildAnchors(text, box, W, H) {
	const mask = document.createElement('canvas');
	mask.width = W;
	mask.height = H;
	const mctx = mask.getContext('2d', { willReadFrequently: true });
	mctx.fillStyle = '#fff';
	mctx.textAlign = 'center';
	mctx.textBaseline = 'middle';

	// Гротеск жирного начертания: у тонких букв на штрих приходится одна точка,
	// и заголовок перестаёт читаться.
	const font = (px) => `900 ${px}px system-ui, "SF Pro Display", Arial, sans-serif`;
	const maxW = box.clientWidth;
	let size = Math.min(96, box.clientHeight);
	mctx.font = font(size);
	const w = mctx.measureText(text).width;
	if (w > maxW) {
		size = Math.floor((size * maxW) / w);
		mctx.font = font(size);
	}
	mctx.fillText(text, box.offsetLeft + maxW / 2, box.offsetTop + box.clientHeight / 2);

	const data = mctx.getImageData(0, 0, W, H).data;
	const anchors = [];
	for (let y = 0; y < H; y += STEP) {
		for (let x = 0; x < W; x += STEP) {
			if (data[(y * W + x) * 4 + 3] <= 128) continue;
			const frags = [];
			for (let i = 0; i < N; i++) frags.push({ x, y, vx: 0, vy: 0 });
			anchors.push({ ox: x, oy: y, frags, active: false });
		}
	}
	return anchors;
}

/** Осколки летят «от курсора»: веер ±90° вокруг направления прочь от него. */
function split(a, mouse) {
	a.active = true;
	const base = Math.atan2(a.oy - mouse.y, a.ox - mouse.x);
	for (const f of a.frags) {
		const angle = base + (Math.random() - 0.5) * Math.PI;
		const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
		f.vx = Math.cos(angle) * speed;
		f.vy = Math.sin(angle) * speed;
	}
}

function step(ctx, a, mouse, dt) {
	const r2 = REPEL_R * REPEL_R;

	if (!a.active) {
		if (mouse.active) {
			const dx = a.ox - mouse.x;
			const dy = a.oy - mouse.y;
			if (dx * dx + dy * dy < r2) split(a, mouse);
		}
		if (!a.active) {
			ctx.beginPath();
			ctx.fillStyle = '#ffffff';
			ctx.arc(a.ox, a.oy, DOT_R, 0, Math.PI * 2);
			ctx.fill();
			return;
		}
	}

	let allRest = true;
	for (let i = 0; i < N; i++) {
		const f = a.frags[i];
		if (mouse.active) {
			const dx = f.x - mouse.x;
			const dy = f.y - mouse.y;
			const d2 = dx * dx + dy * dy;
			if (d2 < r2 && d2 > 0.001) {
				const d = Math.sqrt(d2);
				const force = (REPEL_FORCE * (1 - d / REPEL_R)) / d;
				f.vx += dx * force * dt;
				f.vy += dy * force * dt;
			}
		}
		f.vx = (f.vx + (a.ox - f.x) * SPRING) * FRICTION;
		f.vy = (f.vy + (a.oy - f.y) * SPRING) * FRICTION;
		f.x += f.vx * dt * 8;
		f.y += f.vy * dt * 8;

		const ddx = f.x - a.ox;
		const ddy = f.y - a.oy;
		if (ddx * ddx + ddy * ddy > REST_DISP * REST_DISP
			|| f.vx * f.vx + f.vy * f.vy > REST_VEL * REST_VEL) allRest = false;

		ctx.beginPath();
		ctx.fillStyle = RAINBOW[i];
		ctx.arc(f.x, f.y, DOT_R, 0, Math.PI * 2);
		ctx.fill();
	}

	// Все осколки вернулись — снова одна белая точка.
	if (allRest) {
		a.active = false;
		for (const f of a.frags) {
			f.x = a.ox;
			f.y = a.oy;
			f.vx = f.vy = 0;
		}
	}
}
