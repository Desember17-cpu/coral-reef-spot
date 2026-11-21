// input.js — hands and keys.
//
// The mouse plays by clicking a difference in either panel. The keyboard
// plays too: arrow keys swim a reticle over the picture (Tab hops it to the
// other panel), Enter or Space checks where it rests, H spends a hint, P
// pauses, M mutes. main.js owns the stage transform (the letterboxed scale),
// so it hands in a toStage() that turns a client point into stage pixels;
// everything from there to a panel-local point is worked out here.

import {
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_Y,
  PANEL_W,
  PANEL_H,
} from './config.js';
import { Screen, checkAt, useHint, togglePause, advance } from './state.js';
import { toggleMuted } from './audio.js';
import { HINT_BUTTON } from './render.js';

// Which panel, if any, holds this stage point? Returns { side, x, y } in
// panel-local pixels, or null when the point is on the frame or the header.
export function panelPoint(stageX, stageY) {
  if (stageY < PANEL_Y || stageY > PANEL_Y + PANEL_H) return null;
  if (stageX >= PANEL_LEFT_X && stageX <= PANEL_LEFT_X + PANEL_W) {
    return { side: 'left', x: stageX - PANEL_LEFT_X, y: stageY - PANEL_Y };
  }
  if (stageX >= PANEL_RIGHT_X && stageX <= PANEL_RIGHT_X + PANEL_W) {
    return { side: 'right', x: stageX - PANEL_RIGHT_X, y: stageY - PANEL_Y };
  }
  return null;
}

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function attachInput(canvas, state, toStage) {
  canvas.addEventListener('pointerdown', (event) => {
    const p = toStage(event.clientX, event.clientY);
    if (!p) return;
    const now = performance.now();
    if (state.screen === Screen.PLAYING && !state.paused) {
      if (inRect(p.x, p.y, HINT_BUTTON)) {
        useHint(state, now);
        return;
      }
      const hit = panelPoint(p.x, p.y);
      if (hit) {
        state.reticle.active = false;
        checkAt(state, hit.side, hit.x, hit.y, now);
      }
    } else if (state.screen !== Screen.PLAYING) {
      advance(state);
    }
  });

  window.addEventListener('keydown', (event) => {
    const now = performance.now();
    const key = event.key;
    if (state.screen === Screen.PLAYING) {
      if (key === 'p' || key === 'P') {
        togglePause(state);
        return;
      }
      if (state.paused) return;
      if (key === 'h' || key === 'H') {
        useHint(state, now);
        return;
      }
      if (key === 'm' || key === 'M') {
        state.statusText = toggleMuted() ? 'Sound off.' : 'Sound on.';
        return;
      }
      if (key === 'Tab') {
        event.preventDefault();
        state.reticle.side = state.reticle.side === 'left' ? 'right' : 'left';
        state.reticle.active = true;
        return;
      }
      const step = event.shiftKey ? 42 : 14;
      const r = state.reticle;
      if (key === 'ArrowLeft') r.x = Math.max(8, r.x - step);
      else if (key === 'ArrowRight') r.x = Math.min(PANEL_W - 8, r.x + step);
      else if (key === 'ArrowUp') r.y = Math.max(8, r.y - step);
      else if (key === 'ArrowDown') r.y = Math.min(PANEL_H - 8, r.y + step);
      else if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        checkAt(state, r.side, r.x, r.y, now);
        return;
      } else return;
      r.active = true;
      event.preventDefault();
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      advance(state);
    }
  });
}
