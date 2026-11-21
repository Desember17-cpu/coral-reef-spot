// audio.js — the reef's sounds, synthesized live with WebAudio.
//
// No audio files: every sound is an oscillator with an envelope, made the
// moment it is needed. The context wakes on the first user gesture (browser
// rules), and M mutes the whole tank. Sounds are garnish — every function
// fails silently where WebAudio does not exist.

let context = null;
let muted = false;

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function audioContext() {
  if (muted) return null;
  try {
    if (!context) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(freqFrom, freqTo, seconds, type, volume, delay = 0) {
  const ac = audioContext();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t0 + seconds);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.05);
}

// A find: a bubble-pop that leaps up, with a bright tick on top.
export function playPop() {
  tone(340, 920, 0.14, 'sine', 0.22);
  tone(1240, 1560, 0.08, 'triangle', 0.1, 0.03);
}

// A miss: a dull, low thud — felt more than heard, like the penalty it is.
export function playMiss() {
  tone(150, 70, 0.16, 'sine', 0.18);
}

// A hint: a soft two-note shimmer, a sonar ping and its echo.
export function playHint() {
  tone(880, 880, 0.22, 'sine', 0.1);
  tone(880, 880, 0.3, 'sine', 0.05, 0.16);
}

// The round surfacing: a little rising arpeggio.
export function playRoundClear() {
  [523, 659, 784].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.14, i * 0.09));
}

// The whole survey done: the arpeggio, finished with the high note held.
export function playGameComplete() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, f, i === 3 ? 0.5 : 0.22, 'triangle', 0.14, i * 0.1));
}
