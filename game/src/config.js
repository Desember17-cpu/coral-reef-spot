// config.js — the reef's fixed geometry and tuning, in one place.
//
// The whole game is laid out on a 1280x800 logical stage that render.js scales to
// the window. Two square-ish reef panels sit side by side under the header bar;
// every scene element is painted in panel-local coordinates (600x640), and the
// difference catalog in differences.js uses the same panel-local space, so a
// click, a marker and a painted fish can never drift apart.

export const STAGE_W = 1280;
export const STAGE_H = 800;

export const HEADER_H = 104; // top bar: title, timer, counter, hints, score
export const PANEL_W = 600;
export const PANEL_H = 640;
export const PANEL_Y = 120;
export const PANEL_LEFT_X = 16;
export const PANEL_RIGHT_X = STAGE_W - PANEL_W - 16; // 664
export const FOOTER_Y = 776; // the one-line help strip under the panels

export const DIFFERENCES_PER_ROUND = 12;
export const FIND_POINTS = 100; // per difference found
export const HINT_COST = 25; // points a hint takes back
export const MISS_SECONDS = 5; // a misclick drains this much clock
export const CLICK_RADIUS = 30; // forgiving click distance in panel pixels

export const MARKER_COLOR = '#7dff8a'; // the found-ring green both panels share
export const HINT_PULSE_MS = 1900; // how long a hint ring breathes on the panels
export const POP_MS = 420; // the found marker's pop animation length
