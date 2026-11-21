// random.js — a tiny seeded random generator (mulberry32).
//
// The reef's decorative scatter — pebbles, sand ripples, plankton, bubble
// wobble — is drawn from a seed, never from Math.random, so both panels of a
// pair scatter identically and the staged screenshots in shots.js come out
// the same on every run. Only the differences in differences.js may differ
// between the two panels; nothing in here is allowed to.

export function makeRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A stable per-round seed: the same round always grows the same reef.
export function roundSeed(roundIndex) {
  return 0x9e3779b9 ^ (0x85ebca6b * (roundIndex + 1));
}
