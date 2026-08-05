// The state machine that turns a list of beats into a presentation.
//
// States: idle → tween (same stage) or fadeOut → fadeIn (stage change).
// Nothing here knows what a globe or a classroom is; stages just expose
// {scene, activate, update} and optionally {cssRoot, setSlide}.

import * as THREE from 'three';
import { applyCam, lerpCam, easeInOut } from './camera_rig.js';
import { EARTH_RADIUS, SEEK } from './config.js';
import { hudTitle } from './hud.js';

const FADE = 0.45; // seconds, each half of a stage change

export class Director {
	constructor({ renderer, cssRenderer, camera, cssScene, stages, beats, hud, retro }) {
		Object.assign(this, { renderer, cssRenderer, camera, cssScene, stages, beats, hud, retro });
		this.index = -1;
		this.state = 'idle';
		this.elapsed = 0;
		this.camState = null;
		this.stageName = null;
		this.orbit = null; // OrbitControls in ?dev mode
	}

	get beat() { return this.beats[this.index]; }
	get stage() { return this.stages[this.stageName]; }

	goto(i, { instant = false } = {}) {
		const target = THREE.MathUtils.clamp(i, 0, this.beats.length - 1);
		if (target === this.index && this.state === 'idle') return;
		const beat = this.beats[target];
		const sameStage = this.stageName === beat.stage;
		const canTween = !instant && sameStage && this.camState && this.camState.kind === beat.cam.kind;

		if (canTween) {
			this.from = this.camState;
			this.t = 0;
			this.dur = Math.max(0.001, beat.dur ?? 3);
			this.pending = target;
			this.state = 'tween';
			this.enterBeat(target);
		} else if (instant || !this.camState) {
			this.enterBeat(target);
			this.camState = { ...beat.cam };
			this.state = 'idle';
			this.retro.fade = 0;
			this.fireAction();
		} else {
			this.pending = target;
			this.fadeT = 0;
			this.state = 'fadeOut';
		}
	}

	next() { this.goto(this.index + 1); }
	prev() { this.goto(this.index - 1); }

	/** Apply everything that is not camera movement. */
	enterBeat(i) {
		this.index = i;
		const beat = this.beat;

		if (this.stageName !== beat.stage) {
			this.stageName = beat.stage;
			this.stage.activate(this.camera);
		}
		for (const stage of Object.values(this.stages)) {
			if (stage.cssRoot) stage.cssRoot.visible = stage.name === beat.stage;
			// Что принадлежит этому биту, а что должно погаснуть (контуры и т. п.).
			stage.setActiveAction?.(beat.action ?? null);
		}
		if (beat.slide !== undefined && this.stage.setSlide) this.stage.setSlide(beat.slide);
		if (beat.panels && this.stage.setPanels) this.stage.setPanels(beat.panels);
		// `captionWith: 'action'` — подпись ждёт начала анимации, а пока на экране
		// остаётся подпись предыдущего бита (перелёт ещё «принадлежит» ему).
		this.hud.setBeat(beat, i, this.beats.length, {
			deferCaption: beat.captionWith === 'action',
		});
	}

	/**
	 * Запустить действие бита (обводку контура и прочие анимации). Вызывается,
	 * когда камера уже приехала: анимация начинается на устоявшемся кадре.
	 * @returns {boolean} было ли что запускать — по этому HUD решает, мигать ли
	 */
	fireAction() {
		const beat = this.beat;
		const name = beat?.action;
		if (!name || !this.stage.action) return false;
		this.stage.action(name, { seek: SEEK });
		if (beat.captionWith === 'action') {
			this.hud.setCaption(beat.caption ?? '', hudTitle(beat));
		}
		return true;
	}

	/** Повтор анимации текущего бита (клавиша «r»). */
	replay() { return this.fireAction(); }

	update(dt) {
		this.elapsed += dt;
		const beat = this.beat;

		switch (this.state) {
			case 'tween': {
				this.t += dt;
				const u = easeInOut(Math.min(1, this.t / this.dur));
				this.camState = lerpCam(this.from, beat.cam, u);
				if (this.t >= this.dur) {
					this.camState = { ...beat.cam };
					this.state = 'idle';
					this.fireAction();
				}
				break;
			}
			case 'fadeOut': {
				this.fadeT += dt;
				this.retro.fade = Math.min(1, this.fadeT / FADE);
				if (this.fadeT >= FADE) {
					this.enterBeat(this.pending);
					this.camState = { ...this.beat.cam };
					this.fadeT = 0;
					this.state = 'fadeIn';
				}
				break;
			}
			case 'fadeIn': {
				this.fadeT += dt;
				this.retro.fade = Math.max(0, 1 - this.fadeT / FADE);
				if (this.fadeT >= FADE) { this.retro.fade = 0; this.state = 'idle'; this.fireAction(); }
				break;
			}
			default: {
				// Idle drift keeps the picture alive while the speaker talks.
				const d = beat?.drift;
				if (d && this.camState?.kind === 'geo') {
					this.camState = {
						...this.camState,
						lat: this.camState.lat + (d.lat ?? 0) * dt,
						lon: this.camState.lon + (d.lon ?? 0) * dt,
						alt: this.camState.alt * (1 + (d.altRate ?? 0) * dt),
					};
				}
			}
		}

		if (this.orbit?.enabled) {
			this.orbit.update();
			if (this.stageName === 'earth') {
				this.camState = { ...this.camState, alt: this.camera.position.length() - EARTH_RADIUS };
			}
		} else if (this.camState) {
			applyCam(this.camera, this.camState);
		}

		this.stage.update({ dt, elapsed: this.elapsed, camState: this.camState, camera: this.camera });

		this.retro.render(this.stage.scene, this.camera, this.elapsed);
		this.cssRenderer.domElement.style.opacity = String(1 - this.retro.fade);
		this.cssRenderer.render(this.cssScene, this.camera);
	}
}
