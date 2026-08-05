// Minimal on-screen furniture: beat title, counter, speaker notes, help, and a
// dev readout. Everything is hidden by default except the title and counter.

const HELP = [
	['Space · → · ↵', 'следующий бит'],
	['← · Backspace', 'предыдущий'],
	['Home / End', 'начало / конец'],
	['1…9', 'прыжок к биту'],
	['r', 'повторить анимацию бита'],
	['n', 'заметки докладчика'],
	['h', 'эта справка'],
	['f', 'полный экран'],
	['o', 'свободная камера (?dev)'],
	['c', 'скопировать позицию камеры (?dev)'],
];

/**
 * Заголовок в углу экрана. У слайдов со своим заголовком он только дублирует
 * текст на доске — такие биты помечены `hudTitle: false` и остаются без него;
 * `title` при этом сохраняется, он нужен в заметках и при отладке.
 */
export function hudTitle(beat) {
	return beat.hudTitle === false ? '' : (beat.title ?? beat.id);
}

export class Hud {
	constructor(root, { dev = false } = {}) {
		this.root = root;
		root.innerHTML = `
			<div class="hud-top">
				<span class="hud-name"></span>
			</div>
			<div class="hud-caption"></div>
			<div class="hud-counter"></div>
			<div class="hud-notes"></div>
			<div class="hud-help">
				<h3>Управление</h3>
				<table>${HELP.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
			</div>
			<div class="hud-dev"></div>
			<div class="hud-flash"></div>`;

		this.name = root.querySelector('.hud-name');
		this.caption = root.querySelector('.hud-caption');
		this.counter = root.querySelector('.hud-counter');
		this.notes = root.querySelector('.hud-notes');
		this.help = root.querySelector('.hud-help');
		this.dev = root.querySelector('.hud-dev');
		this.flashEl = root.querySelector('.hud-flash');
		this.dev.classList.toggle('on', dev);
		this.notesVisible = false;
	}

	/**
	 * @param {boolean} deferCaption не менять подпись сейчас — её поставит
	 *   setCaption(), когда у бита начнётся анимация (см. `captionWith` в beats.js)
	 */
	setBeat(beat, i, total, { deferCaption = false } = {}) {
		this.counter.textContent = `${i + 1} / ${total}`;
		this.notes.textContent = beat.notes ?? '';
		this.notes.classList.toggle('on', this.notesVisible && Boolean(beat.notes));
		if (!deferCaption) this.setCaption(beat.caption ?? '', hudTitle(beat));
	}

	/** Крупная подпись вытесняет маленький заголовок, чтобы не дублировать текст. */
	setCaption(caption, fallbackTitle = '') {
		if (caption !== this.caption.textContent) {
			this.caption.textContent = caption;
			this.caption.classList.remove('on');
			void this.caption.offsetWidth; // перезапустить анимацию появления
		}
		this.caption.classList.toggle('on', Boolean(caption));
		this.name.textContent = caption ? '' : fallbackTitle;
	}

	toggleNotes() {
		this.notesVisible = !this.notesVisible;
		this.notes.classList.toggle('on', this.notesVisible && Boolean(this.notes.textContent));
	}

	toggleHelp() { this.help.classList.toggle('on'); }

	setDev(text) { this.dev.textContent = text; }

	flash(message) {
		this.flashEl.textContent = message;
		this.flashEl.classList.add('on');
		clearTimeout(this._flashTimer);
		this._flashTimer = setTimeout(() => this.flashEl.classList.remove('on'), 1600);
	}
}
