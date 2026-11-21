// reef-scene.js — the two panels are two renders of one 3D reef.
//
// buildPanels assembles the round's scene (reef-world.js's stage plus
// reef-life.js's cast), renders it once as the left panel, applies the
// round's twelve differences to the scene, renders again as the right
// panel, and puts the scene back. It also projects every difference's 3D
// anchor through the camera into panel pixels: state.js hit-tests clicks
// against those points and render.js hangs the found markers on them, so
// the ring always sits exactly on the thing that changed.

import { PANEL_W, PANEL_H } from './config.js';
import { DIFFERENCES } from './differences.js';
import { createWorld } from './reef-world.js';
import { createLife } from './reef-life.js';

let renderer = null;

function getRenderer(THREE) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(PANEL_W, PANEL_H, false);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
  }
  return renderer;
}

export function buildPanels(round, roundIndex) {
  const THREE = window.THREE;
  const world = createWorld(THREE, round, roundIndex);
  const life = createLife(THREE, world.scene);

  // The god-ray anchor lives in the world, not the cast: a plain marker
  // object floating where the missing ray would fall.
  const rayAnchor = new THREE.Object3D();
  rayAnchor.position.set(-4.8, 17, -9);
  world.scene.add(rayAnchor);
  const anchors = { ...life.anchors, rays: rayAnchor };

  const applyDifferences = (set) => {
    for (const id of Object.keys(DIFFERENCES)) {
      const on = set.has(id);
      if (id === 'ray-missing') world.rays[1].visible = !on;
      else life.setDifference(id, on);
    }
  };

  const renderPanel = (diffSet) => {
    applyDifferences(diffSet);
    getRenderer(THREE).render(world.scene, world.camera);
    const canvas = document.createElement('canvas');
    canvas.width = PANEL_W;
    canvas.height = PANEL_H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(getRenderer(THREE).domElement, 0, 0);
    // The round's light, laid over the render: noon's glare, dusk's blue.
    ctx.fillStyle = round.palette.tint;
    ctx.fillRect(0, 0, PANEL_W, PANEL_H);
    return canvas;
  };

  const left = renderPanel(new Set());
  const right = renderPanel(new Set(round.differences));
  applyDifferences(new Set()); // leave the scene as found

  world.scene.updateMatrixWorld(true);
  const positions = {};
  const v = new THREE.Vector3();
  for (const [id, diff] of Object.entries(DIFFERENCES)) {
    const anchor = anchors[diff.anchor];
    if (!anchor) continue;
    anchor.getWorldPosition(v);
    v.project(world.camera);
    positions[id] = {
      x: (v.x * 0.5 + 0.5) * PANEL_W,
      y: (0.5 - v.y * 0.5) * PANEL_H,
    };
  }
  return { left, right, positions };
}
