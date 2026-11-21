// main.js — boot: the canvas, the loop, and the wires between the parts.
//
// Creates the game state, paints the first frame, then runs a
// requestAnimationFrame loop: state.js ticks the clock, render.js draws,
// input.js feeds clicks and keys into state.js's verbs. The canvas is
// letterboxed to the 1280x800 stage render.js lays out, and the same
// transform turns pointer positions back into stage pixels for input.js.
// ?shot= staging (shots.js) is applied before the first frame so the
// maker's screenshots render the scenes they name.

import { createGame, tick, clearHintIfSpent } from './state.js';
import { attachInput } from './input.js';
import { computeView, drawFrame } from './render.js';
import { readShotParams, stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const state = createGame();

let view = { scale: 1, ox: 0, oy: 0 };

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  view = computeView(canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

function toStage(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = ((clientX - rect.left) / rect.width) * canvas.width;
  const py = ((clientY - rect.top) / rect.height) * canvas.height;
  return { x: (px - view.ox) / view.scale, y: (py - view.oy) / view.scale };
}

attachInput(canvas, state, toStage);
stageShot(state, readShotParams().shot);

window.__game = { state }; // a handle for the maker's screenshot script

let last = performance.now();
let lastStatus = '';
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick(state, dt);
  clearHintIfSpent(state, now);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#020a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.scale, 0, 0, view.scale, view.ox, view.oy);
  drawFrame(ctx, state, now);
  if (state.statusText !== lastStatus) {
    lastStatus = state.statusText;
    status.textContent = state.statusText;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__ready = true;
