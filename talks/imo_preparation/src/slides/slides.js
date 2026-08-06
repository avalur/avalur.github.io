// Slides are real HTML, hung inside the 3D scene with CSS3DRenderer. That means
// crisp text (not a blurry texture), normal CSS animations, and copy-pasteable
// content — while still living on the blackboard in the right perspective.
//
// Слайды на доске — 1280×720 CSS-пикселей; доска сжимает их до метров.
// Плакаты на правой стене вдвое уже, поэтому у них меньше «холст» (800×450):
// тот же кегль в CSS-пикселях выходит на стене физически крупнее, иначе с места
// зрителя текст на плакате был бы вдвое мельче доски.

import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { initBalls } from './balls.js';

export const SLIDES = [
	{
		id: 'title',
		cls: 'dark',
		html: `
			<div class="kicker">Кипр, Larnaka Roof Talks #6</div>
			<h1>Как подготовить межнарника<br>по математике?</h1>
			<div class="byline">Саша Авдюшенко, 15 августа 2026</div>`,
	},
	{
		id: 'flaass',
		cls: 'dark bio',
		html: `
			<img class="portrait" src="./images/fon_der_flaas_600.jpg" alt="Дмитрий фон дер Флаасс">
			<div class="bio-text">
				<h2>Дима фон дер Флаасс</h2>
				<ul>
					<li>Родился в 1962 году в Пермском крае в семье доктора геологических наук</li>
					<li>В 1975 году поступил в ФМШ в Новосибирске</li>
					<li>В возрасте 15 лет взял «бронзу» в составе команды СССР
						на IMO-1977 и тем же летом поступил на ММФ НГУ</li>
				</ul>
			</div>`,
	},
	{
		id: 'andrey',
		cls: 'dark story',
		html: `
			<h2>Андрей Астрелин</h2>
			<ul>
				<li><b>1983</b> — районная, городская, областная, зональная,
				республиканская, и, наконец, всесоюзная олимпиада - проход на межнар</li>
				<li><b>1984</b> — в Праге на IMO команда СССР заняла уверенное первое место, Андрей первый среди них</li>
			</ul>
			<p>Аттестат Андрей получил во вновь построенной 119-й школе на Шлюзе.
				Дальше Москва, ММФ МГУ.</p>
			<figure>
				<img src="./images/andrey_astrelin.jpg" alt="1987, Академгородок: Андрей, Павел, Ксения">
				<figcaption>1987, Академгородок:<br>
				<a href="https://superliminal.com/andrey/biografiya.html">
				Андрей, Павел и Ксения Астрелины</a>
				</figcaption>
			</figure>`,
	},
	{
		id: 'roster',
		cls: 'dark roster',
		// Годы и имена — две колонки грида, поэтому длинная строка 2016 года
		// переносится под именем, а не под годом.
		html: `
			<h2>Межнарники из Новосибирска</h2>
			<ul>
				<li><span class="y">1977</span><span>Дима фон дер Флаасс</span></li>
				<li><span class="y">1984</span><span>Андрей Астрелин</span></li>
				<li class="gap"><span class="y">.<br>.<br>.</span><span></span></li>
				<li><span class="y">2016</span><span>чуть не хватило Андрею Сергунину
					и Илье Думанскому — кандидаты в сборную</span></li>
				<li><span class="y">2017</span><span>Никита Добронравов (брат-близнец Егор — кандидат)</span></li>
				<li><span class="y">2019, 2020</span><span>Алексей Львов</span></li>
				<li><span class="y">2023, 2024</span><span>Ратибор Коптилин</span></li>
			</ul>`,
	},
	{
		id: 'spb',
		cls: 'dark spb',
		// Обложка почти квадратная (701 × 721) — колонку с ней держит высота
		// строки, ширина подстраивается сама (см. .slide.spb в styles.css).
		html: `
			<h2>Санкт-Петербург</h2>
			<div class="row">
				<img src="./images/spb_circles.png"
					alt="С. А. Генкин, И. В. Итенберг, Д. В. Фомин. Ленинградские математические кружки">
				<p>Классическое пособие Сергея Генкина, Ильи Итенберга и Дмитрия
					Фомина, подготовленное при участии Игоря Рубанова (1994).
					<br>Фактически готовая программа работы школьного математического кружка 6-8 класса.</p>
			</div>`,
	},
	{
		id: 'team-chart',
		cls: 'dark chart',
		// Исследовательская страница показывается целиком, через iframe: график
		// собран из participants.csv (research/build_chart_data.py), и держать
		// вторую его копию в докладе — значит однажды показать устаревшую.
		// ?embed убирает со страницы переключатель темы, таблицу и сноску и
		// включает тёмную тему (см. сам файл).
		html: `<iframe src="./research/team_composition_chart.html?embed"
			title="Откуда участники сборной СССР/России на IMO"></iframe>`,
	},
	{
		id: 'famous',
		cls: 'dark famous',
		// Годы и медали — под именем, а не отдельной колонкой: колонка съела бы
		// ширину у правого столбца, и почти каждая строка сломалась бы надвое.
		// Медали сверены с research/participants.csv.
		html: `
			<h2>Известные межнарники</h2>
			<ul>
				<li>
					<span class="who">Андрей Тоом
						<span class="y">1959 · <b class="bronze">B</b></span></span>
					<span class="what">математик, алгоритм Тоома — Кука (1963)</span>
				</li>
				<li>
					<span class="who">Юрий Матиясевич
						<span class="y">1964 · <b>G</b></span></span>
					<span class="what">10-я проблема Гильберта (1970)</span>
				</li>
				<li>
					<span class="who">Григорий Перельман
						<span class="y">1982 · <b>G</b></span></span>
					<span class="what">доказал гипотезу Пуанкаре (2003)</span>
				</li>
				<li>
					<span class="who">Станислав Смирнов
						<span class="y">1986, 1987 · <b>G</b> <b>G</b></span></span>
					<span class="what">доказал формулу Карди для перколяции, медаль Филдса,
						создал МКН СПбГУ</span>
				</li>
				<li>
					<span class="who">Евгения Малинникова
						<span class="y">1989, 1990, 1991 · <b>G</b> <b>G</b> <b>G</b></span></span>
					<span class="what">премия Института Клэя (2017), профессор — Норвегия,
						теперь Стэнфорд</span>
				</li>
				<li>
					<span class="who">Николай Дуров
						<span class="y">1996, 1997, 1998 · <b>G</b> <b>G</b> <b>G</b></span></span>
					<span class="what">сооснователь ВКонтакте и Телеграма, брат Павла</span>
				</li>
			</ul>`,
	},
	{
		id: 'howto',
		cls: 'dark howto',
		// Заголовок здесь не текст, а точки на холсте (см. balls.js): пустой
		// .head держит под него место в потоке, чтобы вёрстка осталась в CSS.
		// Ссылка на канал — второе кликабельное место в докладе, мышь ей
		// включена отдельно (см. .slide.howto .tg в styles.css).
		html: `
			<canvas class="balls"></canvas>
			<div class="head"></div>
			<ol>
				<li>Родиться в семье учёных</li>
				<li>Желательно в Санкт-Петербурге</li>
				<li>Пораньше начать, много и регулярно заниматься математикой</li>
				<li>Кружок и мотивированные одноклассники очень помогают</li>
				<li>Часто участвовать в индивидуальных и командных соревнованиях</li>
			</ol>
			<a class="tg" target="_blank" rel="noopener"
				href="https://t.me/TechneNotes">@TechneNotes</a>`,
		init(el) {
			return initBalls(el.querySelector('.balls'), {
				text: 'Howto стать межнарником',
				box: el.querySelector('.head'),
			});
		},
	},
];

// Плакаты и картины на правой стене. Первый — настоящий, дальше заглушки.
export const PANEL_SLIDES = [
	{
		id: 'panel-1977',
		cls: 'photo',
		// Выпускной планшет ФМШ № 165, класс 10-7, 1977 год.
		html: `<img src="./images/77_10_7_flaas.jpg" alt="ФМШ № 165, выпускники 10-7 класса, 1977">`,
	},
	{
		id: 'panel-sovenok',
		cls: 'photo',
		// Страница кружка «Совёнок», 9 класс, 2025/26. Мелкий текст скриншота
		// читается только потому, что у этой картины холст во всю ширину файла
		// (см. canvasWidth в PANELS).
		// Плашка в углу — единственное кликабельное место в докладе: слой CSS3D
		// стоит с pointer-events: none, у ссылки он включён обратно (см. styles.css).
		html: `
			<img src="./images/sovenok_2026.png" alt="Кружок «Совёнок», 9 класс, 2025/2026">
			<a class="source" target="_blank" rel="noopener"
				href="https://www.sovenok.academy/groups-academ/9-%D0%BA%D0%BB%D0%B0%D1%81%D1%81-2025-2026-%D1%83%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D0%B9-%D0%B3%D0%BE%D0%B4"
				>sovenok.academy ↗</a>`,
	},
	{
		id: 'panel-task',
		cls: 'poster',
		html: `
			<h2>Задача дня</h2>
			<p class="lead">условие приедет сюда — место<br>под формулу и чертёж</p>
			<p class="note">плакат-заглушка № 2</p>`,
	},
	{
		id: 'panel-blank',
		cls: 'poster',
		html: `
			<h2>Пусто</h2>
			<p class="note">резервный плакат</p>`,
	},
];

/**
 * A slide surface that lives in the 3D scene.
 * @param {number} widthMeters physical width of the surface
 * @param {object} [opts]
 * @param {Array}  [opts.slides] which deck to show (SLIDES / PANEL_SLIDES)
 * @param {number} [opts.canvasWidth] CSS-ширина холста
 * @param {number} [opts.aspect] отношение ширины к высоте (по умолчанию 16:9)
 * @param {number} [opts.start] стартовый слайд
 */
export function createSlideDeck(widthMeters = 4.4, opts = {}) {
	const { slides = SLIDES, canvasWidth = 1280, aspect = 16 / 9, start = 0 } = opts;
	const el = document.createElement('div');
	el.className = 'slide-frame';
	el.style.width = `${canvasWidth}px`;
	el.style.height = `${Math.round(canvasWidth / aspect)}px`;
	const slide = document.createElement('div');
	slide.className = 'slide chalk';
	el.appendChild(slide);

	const object = new CSS3DObject(el);
	// CSS3DObject ставит элементу pointer-events: auto инлайном — это сильнее,
	// чем `#css3d { pointer-events: none }` в стилях, и слайд начинает ловить
	// клики вместо канваса: на битах, где доска во весь экран, доклад переставал
	// листаться мышью. Слайд — декорация, мышь ему не нужна; ссылка внутри
	// (плашка «источник») включает её себе сама и продолжает работать.
	el.style.pointerEvents = 'none';
	const scale = widthMeters / canvasWidth;
	object.scale.setScalar(scale);

	let index = -1;
	let dispose = null; // остановить «живой» слайд, когда с него уходят

	function setSlide(i) {
		const next = ((i % slides.length) + slides.length) % slides.length;
		if (next === index) return;
		index = next;
		const s = slides[index];
		dispose?.();
		dispose = null;
		slide.className = `slide ${s.cls || 'chalk'}`;
		slide.innerHTML = s.html;
		// Re-trigger the entrance animation.
		slide.style.animation = 'none';
		void slide.offsetWidth;
		slide.style.animation = '';
		// Слайд может быть живым: init() поднимает свою анимацию и возвращает,
		// чем её выключить. Вызываем после offsetWidth — вёрстка уже посчитана,
		// и init может мерить свои блоки.
		dispose = s.init?.(slide) ?? null;
	}

	setSlide(start);

	return { object, setSlide, get index() { return index; }, count: slides.length };
}
