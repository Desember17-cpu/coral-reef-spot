// render.js — everything the player sees, drawn fresh each frame.
//
// A frame is: the header (round, clock, the big remaining counter, hints,
// score), the two framed panels blitted from state.js's pre-painted
// canvases, the life laid over them (drifting bubbles — identical on both
// panels, always — found markers with their pop, a breathing hint ring, the
// keyboard reticle), the help line, and whichever overlay screen is up.
// Nothing here decides anything; it only reads state.js and draws it.

import {
  STAGE_W,
  STAGE_H,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_Y,
  PANEL_W,
  PANEL_H,
  FOOTER_Y,
  MARKER_COLOR,
  POP_MS,
} from './config.js';
import { ROUNDS } from './rounds.js';
import { differenceById } from './differences.js';
import { buildPanels } from './reef-scene.js';
import { Screen, remaining, surveyGrade } from './state.js';

export const HINT_BUTTON = { x: 1006, y: 30, w: 122, h: 44 };

const SANS = '"Trebuchet MS", Verdana, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

export function computeView(width, height) {
  const scale = Math.min(width / STAGE_W, height / STAGE_H);
  return { scale, ox: (width - STAGE_W * scale) / 2, oy: (height - STAGE_H * scale) / 2 };
}

export function drawFrame(ctx, state, now) {
  ctx.fillStyle = '#04121f';
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const glow = ctx.createRadialGradient(640, 330, 80, 640, 330, 760);
  glow.addColorStop(0, 'rgba(38,110,150,0.35)');
  glow.addColorStop(1, 'rgba(4,18,31,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  drawHeader(ctx, state);
  if (state.panels) {
    drawPanel(ctx, state, state.panels.left, PANEL_LEFT_X, 'PICTURE A', now);
    drawPanel(ctx, state, state.panels.right, PANEL_RIGHT_X, 'PICTURE B', now);
  } else {
    drawPanel(ctx, state, titleBackdrop(), PANEL_LEFT_X, 'PICTURE A', now);
    drawPanel(ctx, state, titleBackdrop(), PANEL_RIGHT_X, 'PICTURE B', now);
  }
  drawFooter(ctx, state);

  if (state.screen === Screen.TITLE) drawTitle(ctx, state, now);
  else if (state.screen === Screen.ROUND_CLEAR) drawRoundClear(ctx, state);
  else if (state.screen === Screen.TIME_UP) drawTimeUp(ctx, state);
  else if (state.screen === Screen.END) drawEnd(ctx, state);
  else if (state.paused) drawPaused(ctx);
}

let backdrop = null;
function titleBackdrop() {
  // Before the first dive there are no panels yet: the title floats over
  // the morning reef itself, rendered once and kept.
  if (!backdrop) backdrop = buildPanels(ROUNDS[0], 0).left;
  return backdrop;
}

function drawHeader(ctx, state) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#eaf7fc';
  ctx.font = `700 24px ${SERIF}`;
  ctx.fillText('CORAL REEF AQUARIUM', 16, 40);
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 12.5px ${SANS}`;
  const roundLine = state.screen === Screen.TITLE
    ? 'SPOT THE DIFFERENCE · THREE DIVES · TWELVE DIFFERENCES EACH'
    : `SPOT THE DIFFERENCE · ROUND ${state.roundIndex + 1} OF ${ROUNDS.length} — ${state.round.name.toUpperCase()}`;
  ctx.fillText(roundLine, 17, 64);

  // The clock: a draining bar with the seconds beside it, red at the end.
  const frac = Math.max(0, state.timeLeft / state.round.seconds);
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 11px ${SANS}`;
  ctx.fillText('TIME', 468, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, 468, 38, 300, 13, 6);
  ctx.fill();
  ctx.fillStyle = frac < 0.18 ? '#ff5d5d' : '#ffd166';
  if (frac > 0) {
    roundRect(ctx, 468, 38, 300 * frac, 13, 6);
    ctx.fill();
  }
  ctx.fillStyle = '#eaf7fc';
  ctx.font = `700 21px ${SANS}`;
  ctx.fillText(formatClock(state.timeLeft), 780, 52);

  // The remaining counter: the number the whole game turns on, big and lit.
  const left = state.screen === Screen.TITLE ? state.round.differences.length : remaining(state);
  ctx.beginPath();
  ctx.arc(892, 47, 27, 0, Math.PI * 2);
  ctx.fillStyle = '#0e5a7d';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = MARKER_COLOR;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 27px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(String(left), 892, 57);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 11px ${SANS}`;
  ctx.fillText('TO FIND', 926, 43);
  ctx.fillText('THIS DIVE', 926, 59);

  // The hint button, drawn where input.js listens for it.
  const b = HINT_BUTTON;
  ctx.fillStyle = state.hintsLeft > 0 ? '#14597e' : 'rgba(255,255,255,0.08)';
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,230,250,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.stroke();
  ctx.fillStyle = '#eaf7fc';
  ctx.font = `700 15px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`HINT · ${state.hintsLeft}`, b.x + b.w / 2, b.y + 21);
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 10.5px ${SANS}`;
  ctx.fillText('press H', b.x + b.w / 2, b.y + 36);
  ctx.textAlign = 'left';

  // Score, at the far right.
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 11px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('SCORE', 1264, 40);
  ctx.fillStyle = '#ffd166';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText(String(state.score), 1264, 68);
  ctx.textAlign = 'left';
}

function drawPanel(ctx, state, image, x, label, now) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#06283d';
  roundRect(ctx, x - 5, PANEL_Y - 5, PANEL_W + 10, PANEL_H + 10, 12);
  ctx.fill();
  ctx.restore();
  ctx.drawImage(image, x, PANEL_Y);
  ctx.strokeStyle = 'rgba(170,225,245,0.85)';
  ctx.lineWidth = 2;
  roundRect(ctx, x - 5, PANEL_Y - 5, PANEL_W + 10, PANEL_H + 10, 12);
  ctx.stroke();

  // The picture's name chip, so the pair reads as a pair at a glance.
  ctx.fillStyle = 'rgba(4,24,38,0.78)';
  roundRect(ctx, x + 10, PANEL_Y + 10, 96, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#cfeef9';
  ctx.font = `700 12.5px ${SANS}`;
  ctx.fillText(label, x + 22, PANEL_Y + 26);

  drawAmbientBubbles(ctx, x, now);
  if (state.screen === Screen.PLAYING || state.screen === Screen.ROUND_CLEAR || state.screen === Screen.END) {
    drawMarkers(ctx, state, x, now);
    drawHintPulse(ctx, state, x, now);
    drawMissMark(ctx, state, x, now);
  }
  if (x === (state.reticle.side === 'left' ? PANEL_LEFT_X : PANEL_RIGHT_X)) {
    drawReticle(ctx, state, x);
  }
}

// Bubbles drifting up the water column — the same lanes, the same phase on
// both panels, so the life never masquerades as a difference.
function drawAmbientBubbles(ctx, panelX, now) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  for (let i = 0; i < 13; i++) {
    const lane = (i * 173 + 41) % PANEL_W;
    const speed = 9 + (i % 4) * 3.5;
    const rise = (now / 1000) * speed + i * 113;
    const y = PANEL_Y + PANEL_H - (rise % (PANEL_H + 36)) + 18;
    const r = 1.6 + (i % 3) * 0.9;
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.strokeStyle = 'rgba(255,255,255,0.30)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(panelX + lane, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function markerRadius(d) {
  return Math.min(31, Math.max(16, d.r * 0.62));
}

function drawMarkers(ctx, state, panelX, now) {
  for (const id of state.found) {
    const d = differenceById(id);
    const pos = state.positions[id];
    if (!pos) continue;
    const cx = panelX + pos.x;
    const cy = PANEL_Y + pos.y;
    const age = now - (state.pops.get(id) ?? -Infinity);
    let scale = 1;
    if (age < POP_MS) {
      const t = age / POP_MS;
      scale = 0.45 + 0.75 * easeOutBack(t); // overshoots, then settles: the pop
    }
    const r = markerRadius(d) * scale;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = MARKER_COLOR;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    if (age < POP_MS) {
      // Sparkle ticks while the pop is young.
      ctx.strokeStyle = `rgba(255,255,190,${1 - age / POP_MS})`;
      ctx.lineWidth = 2.4;
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + 0.4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4));
        ctx.lineTo(cx + Math.cos(a) * (r + 11), cy + Math.sin(a) * (r + 11));
        ctx.stroke();
      }
    }
  }
}

function drawHintPulse(ctx, state, panelX, now) {
  if (!state.hintPulse) return;
  const age = now - state.hintPulse.start;
  if (age > 1900) return;
  const d = differenceById(state.hintPulse.id);
  const pos = state.positions[state.hintPulse.id];
  if (!pos) return;
  const cx = panelX + pos.x;
  const cy = PANEL_Y + pos.y;
  const phase = (age % 620) / 620; // three gentle breaths across the pulse
  const r = 12 + phase * (d.r + 16);
  ctx.strokeStyle = `rgba(255,209,102,${0.85 * (1 - phase)})`;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255,209,102,${0.10 * (1 - age / 1900)})`;
  ctx.beginPath();
  ctx.arc(cx, cy, d.r + 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawMissMark(ctx, state, panelX, now) {
  const m = state.missMark;
  if (!m) return;
  const sideX = m.side === 'left' ? PANEL_LEFT_X : PANEL_RIGHT_X;
  if (sideX !== panelX) return;
  const age = now - m.start;
  if (age > 650) return;
  const alpha = 1 - age / 650;
  const cx = panelX + m.x;
  const cy = PANEL_Y + m.y;
  ctx.strokeStyle = `rgba(255,84,84,${alpha})`;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 10);
  ctx.lineTo(cx + 10, cy + 10);
  ctx.moveTo(cx + 10, cy - 10);
  ctx.lineTo(cx - 10, cy + 10);
  ctx.stroke();
}

function drawReticle(ctx, state, panelX) {
  if (!state.reticle.active || state.screen !== Screen.PLAYING) return;
  const cx = panelX + state.reticle.x;
  const cy = PANEL_Y + state.reticle.y;
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[0, -22], [0, 22], [-22, 0], [22, 0]]) {
    ctx.moveTo(cx + dx * 0.72, cy + dy * 0.72);
    ctx.lineTo(cx + dx, cy + dy);
  }
  ctx.stroke();
}

function drawFooter(ctx, state) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7fb6cc';
  ctx.font = `600 13.5px ${SANS}`;
  const text = state.screen === Screen.PLAYING
    ? 'Click a difference in either picture — it counts on both · Arrow keys swim the ring, Enter checks it · H hint · P pause · M sound · A misclick costs 5 seconds'
    : 'Coral Reef Aquarium — an original reef, modelled in 3D · Three dives, three lights, thirty-six differences';
  ctx.fillText(text, STAGE_W / 2, FOOTER_Y);
  ctx.textAlign = 'left';
}

function drawTitle(ctx, state, now) {
  veil(ctx, 0.52);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fdf6d8';
  ctx.font = `700 57px ${SERIF}`;
  ctx.fillText('CORAL REEF AQUARIUM', STAGE_W / 2, 268);
  ctx.fillStyle = MARKER_COLOR;
  ctx.font = `700 21px ${SANS}`;
  ctx.fillText('S P O T   T H E   D I F F E R E N C E', STAGE_W / 2, 306);
  ctx.fillStyle = '#dceef5';
  ctx.font = `400 17.5px ${SANS}`;
  ctx.fillText('Two pictures of one reef hang side by side. Twelve things have changed in the second.', STAGE_W / 2, 356);
  ctx.fillText('Click each change you find — in either picture — before the light runs out.', STAGE_W / 2, 382);
  ctx.fillText('Three dives: Morning Reef, Noon Glare, and the Deep Dusk, each quieter than the last.', STAGE_W / 2, 408);
  const pulse = 0.72 + 0.28 * Math.sin(now / 300);
  ctx.fillStyle = `rgba(255,209,102,${pulse})`;
  ctx.font = `800 23px ${SANS}`;
  ctx.fillText('PRESS ENTER OR CLICK TO DIVE IN', STAGE_W / 2, 478);
  ctx.fillStyle = '#8fc7dd';
  ctx.font = `600 13.5px ${SANS}`;
  ctx.fillText('Mouse or keyboard · Hints breathe a ring around one difference · Misclicks drain the clock', STAGE_W / 2, 512);
  ctx.textAlign = 'left';
}

function drawRoundClear(ctx, state) {
  veil(ctx, 0.45);
  card(ctx, 400, 262, 480, 236);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fdf6d8';
  ctx.font = `700 33px ${SERIF}`;
  ctx.fillText(`${state.round.name.toUpperCase()} — CLEAR!`, STAGE_W / 2, 330);
  ctx.fillStyle = '#dceef5';
  ctx.font = `400 17px ${SANS}`;
  ctx.fillText(`All 12 differences found with ${formatClock(state.timeLeft)} of light to spare.`, STAGE_W / 2, 372);
  ctx.fillText(`Score so far: ${state.score} · Misclicks: ${state.misclicks} · Hints used: ${state.hintsUsed}`, STAGE_W / 2, 402);
  ctx.fillStyle = '#ffd166';
  ctx.font = `800 19px ${SANS}`;
  const next = ROUNDS[state.roundIndex + 1];
  ctx.fillText(`PRESS ENTER FOR ${next.name.toUpperCase()}`, STAGE_W / 2, 452);
  ctx.textAlign = 'left';
}

function drawTimeUp(ctx, state) {
  veil(ctx, 0.5);
  card(ctx, 400, 262, 480, 236);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fdf6d8';
  ctx.font = `700 33px ${SERIF}`;
  ctx.fillText('THE LIGHT FADED', STAGE_W / 2, 330);
  ctx.fillStyle = '#dceef5';
  ctx.font = `400 17px ${SANS}`;
  ctx.fillText(`You found ${state.found.size} of 12 differences in ${state.round.name}.`, STAGE_W / 2, 372);
  ctx.fillText('Dive it again — the points this dive earned are handed back.', STAGE_W / 2, 402);
  ctx.fillStyle = '#ffd166';
  ctx.font = `800 19px ${SANS}`;
  ctx.fillText('PRESS ENTER TO DIVE AGAIN', STAGE_W / 2, 452);
  ctx.textAlign = 'left';
}

function drawEnd(ctx, state) {
  veil(ctx, 0.55);
  card(ctx, 340, 218, 600, 330);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fdf6d8';
  ctx.font = `700 36px ${SERIF}`;
  ctx.fillText('SURVEY COMPLETE', STAGE_W / 2, 282);
  ctx.fillStyle = MARKER_COLOR;
  ctx.font = `700 19px ${SANS}`;
  ctx.fillText(surveyGrade(state).toUpperCase(), STAGE_W / 2, 316);
  ctx.fillStyle = '#dceef5';
  ctx.font = `400 17.5px ${SANS}`;
  const total = ROUNDS.reduce((n, r) => n + r.differences.length, 0);
  ctx.fillText(`Differences found: ${state.totalFound} of ${total}`, STAGE_W / 2, 356);
  ctx.fillText(`Misclicks: ${state.misclicks} · Hints used: ${state.hintsUsed} · Time in the water: ${formatClock(state.elapsed)}`, STAGE_W / 2, 386);
  ctx.fillStyle = '#ffd166';
  ctx.font = `800 30px ${SANS}`;
  ctx.fillText(`FINAL SCORE ${state.score}`, STAGE_W / 2, 440);
  ctx.font = `800 18px ${SANS}`;
  ctx.fillText('PRESS ENTER TO DIVE AGAIN', STAGE_W / 2, 492);
  ctx.textAlign = 'left';
}

function drawPaused(ctx) {
  veil(ctx, 0.45);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fdf6d8';
  ctx.font = `700 40px ${SERIF}`;
  ctx.fillText('PAUSED', STAGE_W / 2, 420);
  ctx.fillStyle = '#dceef5';
  ctx.font = `600 16px ${SANS}`;
  ctx.fillText('Press P to swim on', STAGE_W / 2, 456);
  ctx.textAlign = 'left';
}

function veil(ctx, alpha) {
  ctx.fillStyle = `rgba(3,14,24,${alpha})`;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(6,32,48,0.92)';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,220,245,0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function easeOutBack(t) {
  const c = 1.70158;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
}
