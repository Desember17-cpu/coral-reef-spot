// state.js — the game itself: screens, rounds, finds, hints and the clock.
//
// Everything rule-like lives here and nowhere else. render.js only reads the
// state to draw it; input.js only calls the verbs defined here (checkAt,
// useHint, togglePause, advance). The two panels of a round are rendered
// once, up front, from the one 3D reef by reef-scene.js — a frame of play
// is then just two blits plus markers, so the hunt never stutters.

import { ROUNDS } from './rounds.js';
import { differenceById } from './differences.js';
import { buildPanels } from './reef-scene.js';
import {
  PANEL_W,
  PANEL_H,
  FIND_POINTS,
  HINT_COST,
  MISS_SECONDS,
  CLICK_RADIUS,
  HINT_PULSE_MS,
} from './config.js';
import { playPop, playMiss, playHint, playRoundClear, playGameComplete } from './audio.js';

export const Screen = {
  TITLE: 'title',
  PLAYING: 'playing',
  ROUND_CLEAR: 'round-clear',
  TIME_UP: 'time-up',
  END: 'end',
};

export function createGame() {
  return {
    screen: Screen.TITLE,
    roundIndex: 0,
    round: ROUNDS[0],
    found: new Set(),
    hintsLeft: ROUNDS[0].hints,
    timeLeft: ROUNDS[0].seconds,
    paused: false,
    score: 0,
    roundEarned: 0, // points this round's finds have banked (a retry gives them back)
    totalFound: 0,
    misclicks: 0,
    hintsUsed: 0,
    elapsed: 0, // seconds of play across the whole survey
    panels: null, // { left, right } canvases, rendered by reef-scene.js
    positions: {}, // difference id -> { x, y } panel pixels, projected from 3D
    pops: new Map(), // difference id -> ms timestamp the find marker popped
    hintPulse: null, // { id, start } while a hint ring breathes
    missMark: null, // { x, y, side, start } the red X of a misclick
    reticle: { side: 'left', x: PANEL_W / 2, y: PANEL_H / 2 }, // keyboard ring
    statusText: 'Coral Reef Aquarium. Press Enter to dive in.',
  };
}

export function remaining(state) {
  return state.round.differences.length - state.found.size;
}

export function beginGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.misclicks = 0;
  state.hintsUsed = 0;
  state.elapsed = 0;
  startRound(state, 0);
}

export function startRound(state, roundIndex) {
  state.roundIndex = roundIndex;
  state.round = ROUNDS[roundIndex];
  state.found = new Set();
  state.hintsLeft = state.round.hints;
  state.timeLeft = state.round.seconds;
  state.roundEarned = 0;
  state.paused = false;
  state.pops = new Map();
  state.hintPulse = null;
  state.missMark = null;
  state.reticle = { side: 'left', x: PANEL_W / 2, y: PANEL_H / 2 };
  const built = buildPanels(state.round, roundIndex);
  state.panels = { left: built.left, right: built.right };
  state.positions = built.positions;
  state.screen = Screen.PLAYING;
  state.statusText = `${state.round.name}: find ${state.round.differences.length} differences.`;
}

// A click (or an Enter on the reticle) at panel-local x, y on one side.
// Clicking either panel works: a difference lives in both pictures at once.
export function checkAt(state, side, x, y, now) {
  if (state.screen !== Screen.PLAYING || state.paused) return;
  let best = null;
  let bestDist = Infinity;
  for (const id of state.round.differences) {
    if (state.found.has(id)) continue;
    const d = differenceById(id);
    const pos = state.positions[id];
    if (!pos) continue;
    const dist = Math.hypot(pos.x - x, pos.y - y);
    if (dist < Math.max(CLICK_RADIUS, d.r) && dist < bestDist) {
      best = id;
      bestDist = dist;
    }
  }
  if (best) {
    state.found.add(best);
    state.pops.set(best, now);
    state.score += FIND_POINTS;
    state.roundEarned += FIND_POINTS;
    state.totalFound += 1;
    if (state.hintPulse && state.hintPulse.id === best) state.hintPulse = null;
    playPop();
    state.statusText = `Found ${differenceById(best).name}. ${remaining(state)} to go.`;
    if (remaining(state) === 0) finishRound(state);
  } else {
    state.misclicks += 1;
    state.timeLeft = Math.max(0, state.timeLeft - MISS_SECONDS);
    state.missMark = { x, y, side, start: now };
    playMiss();
    state.statusText = `Not there. The clock loses ${MISS_SECONDS} seconds.`;
    if (state.timeLeft <= 0) timeUp(state);
  }
}

function finishRound(state) {
  if (state.roundIndex >= ROUNDS.length - 1) {
    state.screen = Screen.END;
    playGameComplete();
    state.statusText = `Survey complete. Final score ${state.score}.`;
  } else {
    state.screen = Screen.ROUND_CLEAR;
    playRoundClear();
    state.statusText = `${state.round.name} complete. Press Enter for the next dive.`;
  }
}

function timeUp(state) {
  state.screen = Screen.TIME_UP;
  state.statusText = `The light faded on ${state.round.name}. Press Enter to dive it again.`;
}

// Spend a hint: a ring breathes around one unfound difference on both panels.
export function useHint(state, now) {
  if (state.screen !== Screen.PLAYING || state.paused) return;
  if (state.hintsLeft <= 0) {
    state.statusText = 'No hints left in this round.';
    return;
  }
  const unfound = state.round.differences.filter((id) => !state.found.has(id));
  if (unfound.length === 0) return;
  const id = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintPulse = { id, start: now };
  playHint();
  state.statusText = 'A hint pulses somewhere on the reef.';
}

export function hintPulseAge(state, now) {
  if (!state.hintPulse) return Infinity;
  return now - state.hintPulse.start;
}

export function clearHintIfSpent(state, now) {
  if (state.hintPulse && hintPulseAge(state, now) > HINT_PULSE_MS) state.hintPulse = null;
}

export function togglePause(state) {
  if (state.screen !== Screen.PLAYING) return;
  state.paused = !state.paused;
  state.statusText = state.paused ? 'Paused.' : 'Playing.';
}

// The clock. Called every frame with the seconds since the last frame.
export function tick(state, dtSeconds) {
  if (state.screen !== Screen.PLAYING || state.paused) return;
  state.timeLeft -= dtSeconds;
  state.elapsed += dtSeconds;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    timeUp(state);
  }
}

// The one Enter/click verb for menus: what happens next depends on the screen.
export function advance(state) {
  if (state.screen === Screen.TITLE || state.screen === Screen.END) {
    beginGame(state);
  } else if (state.screen === Screen.ROUND_CLEAR) {
    startRound(state, state.roundIndex + 1);
  } else if (state.screen === Screen.TIME_UP) {
    state.score -= state.roundEarned; // a retried round hands its points back
    startRound(state, state.roundIndex);
  }
}

export function surveyGrade(state) {
  // A title for the end screen, earned by accuracy first, speed second.
  if (state.misclicks === 0 && state.hintsUsed === 0) return 'Eagle-Eyed Reef Keeper';
  if (state.misclicks <= 4) return 'Reef Ranger';
  if (state.misclicks <= 10) return 'Keen Snorkeller';
  return 'Patient Beachcomber';
}
