// shots.js — the staged scenes behind the maker's screenshots.
//
// The screenshots in screenshots/ are real renders of this game in a
// browser, taken with ?shot= in the address: each value below freezes a
// truthful moment — the cover is round one mid-hunt with five differences
// already ringed and seven still hiding, the dusk shot is round three in
// its blue dark, and the end shot is a finished survey. Nothing is drawn
// for the camera that the game does not draw for a player.

import { Screen, beginGame, startRound } from './state.js';

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return { shot: params.get('shot'), seed: Number(params.get('seed') ?? 1) };
}

export function stageShot(state, shot) {
  if (!shot || shot === 'start') return; // the title screen, as it opens
  const settled = performance.now() - 2000; // marker pops long finished
  if (shot === 'cover') {
    beginGame(state);
    findSome(state, ['starfish-missing', 'angelfish-stripe', 'school-fish-missing', 'amphora-crack', 'seahorse-colour'], settled);
    state.timeLeft = 157;
    state.elapsed = 83;
    state.score = 500;
  } else if (shot === 'dusk') {
    beginGame(state);
    startRound(state, 2);
    findSome(state, ['fan-colour', 'turtle-scute', 'crab-claw', 'snail-shell'], settled);
    state.timeLeft = 96;
    state.elapsed = 402;
    state.score = 2300;
    state.totalFound = 28;
    state.misclicks = 3;
    state.hintsUsed = 2;
    state.hintsLeft = 1;
  } else if (shot === 'end') {
    beginGame(state);
    state.totalFound = 36;
    state.misclicks = 3;
    state.hintsUsed = 2;
    state.elapsed = 512;
    state.score = 3275;
    state.screen = Screen.END;
  }
}

function findSome(state, ids, when) {
  for (const id of ids) {
    state.found.add(id);
    state.pops.set(id, when);
    state.totalFound += 1;
  }
}
