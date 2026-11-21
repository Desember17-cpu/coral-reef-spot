// reef-world.js — the stage the reef stands on, in Three.js.
//
// One scene per round: a gradient water backdrop, fog for depth, a sand
// floor scattered with pebbles, rock clusters, four slanted god-ray planes
// (the second is a difference target), and — in the dusk round — a drift of
// glowing plankton. The round's palette from rounds.js drives every colour
// and light level, so morning, noon and dusk are the same stage re-lit.
// reef-life.js furnishes it; reef-scene.js points the camera.

import { makeRandom, roundSeed } from './random.js';

export function createWorld(THREE, round, roundIndex) {
  const palette = round.palette;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(palette.waterBottom), 58, 135);

  const camera = new THREE.PerspectiveCamera(38, 600 / 640, 0.1, 300);
  camera.position.set(0, 1.5, 64);
  camera.lookAt(0, -0.5, 0);

  // Light: a warm key from the surface, a cool fill, and the water's own
  // ambient bounce. Dusk dims all three and turns the key blue.
  const dusk = roundIndex === 2;
  const hemi = new THREE.HemisphereLight(
    new THREE.Color(palette.waterTop),
    new THREE.Color(palette.sandBottom),
    dusk ? 0.68 : 0.95,
  );
  scene.add(hemi);
  const key = new THREE.DirectionalLight(dusk ? 0x8fb6ff : 0xfff1d6, dusk ? 0.85 : 1.25);
  key.position.set(16, 30, 42);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fd4ff, dusk ? 0.22 : 0.4);
  fill.position.set(-24, 6, 30);
  scene.add(fill);

  scene.add(makeBackdrop(THREE, palette));
  const rays = makeGodRays(THREE, palette);
  for (const ray of rays) scene.add(ray);
  scene.add(makeSandFloor(THREE, palette));
  makeRocks(THREE, palette, scene);
  makePebbles(THREE, roundSeed(roundIndex), scene);
  if (palette.plankton > 0) scene.add(makePlankton(THREE, palette.plankton, roundSeed(roundIndex) ^ 0x77));

  return { scene, camera, rays };
}

function makeBackdrop(THREE, palette) {
  // A tall plane far behind the reef, painted with the round's water
  // gradient and a soft bloom of surface light at the top.
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, palette.waterTop);
  grad.addColorStop(0.55, palette.waterMid);
  grad.addColorStop(1, palette.waterBottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 84),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }),
  );
  mesh.position.set(0, 2, -30);
  return mesh;
}

function makeGodRays(THREE, palette) {
  // Four translucent blades of light slanting down through the water.
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfffbe8,
    transparent: true,
    opacity: palette.rayAlpha * 1.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const rays = [];
  const xs = [-14.5, -4.8, 5.2, 15];
  xs.forEach((x, i) => {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(4.6 + (i % 2) * 1.6, 58), mat);
    ray.position.set(x + 6, 9, -9 - (i % 2) * 2);
    ray.rotation.z = -0.42;
    rays.push(ray);
  });
  return rays;
}

function makeSandFloor(THREE, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, palette.sandTop);
  grad.addColorStop(1, palette.sandBottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const rng = makeRandom(1234);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rng() > 0.5 ? 'rgba(120,90,40,0.18)' : 'rgba(255,246,210,0.16)';
    g.fillRect(rng() * 256, rng() * 256, 1.6, 1.6);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(78, 40),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -21.5;
  return floor;
}

function makeRocks(THREE, palette, scene) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5d7186, roughness: 0.95, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(palette.silhouette), roughness: 1, flatShading: true });
  const rocks = [
    { p: [-19.5, -19.5, -1], s: [7.5, 4.6, 5.5], m: rockMat },
    { p: [-14.5, -20.3, 3.5], s: [4.6, 2.8, 3.6], m: rockMat },
    { p: [19.8, -18.8, -2.5], s: [7, 5.2, 5.4], m: rockMat },
    { p: [15, -20.2, 4], s: [4.4, 2.6, 3.4], m: rockMat },
    { p: [-23, -14, -13], s: [12, 9, 7], m: darkMat },
    { p: [4, -15.5, -15], s: [14, 8, 7], m: darkMat },
    { p: [24, -13.5, -12], s: [10, 9.5, 7], m: darkMat },
    { p: [-6, -19.8, 6], s: [3.6, 2, 2.8], m: rockMat },
  ];
  for (const r of rocks) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), r.m);
    rock.position.set(...r.p);
    rock.scale.set(...r.s);
    rock.rotation.set(r.p[0] * 0.13, r.p[1] * 0.29, r.p[2] * 0.07);
    scene.add(rock);
  }
}

function makePebbles(THREE, seed, scene) {
  // The scatter is seeded, so it is the reef's own furniture — identical in
  // both panels because both panels render this one scene.
  const rng = makeRandom(seed);
  const light = new THREE.MeshStandardMaterial({ color: 0xcfc0a0, roughness: 1, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x6b5a41, roughness: 1, flatShading: true });
  const geo = new THREE.DodecahedronGeometry(0.55, 0);
  for (let i = 0; i < 42; i++) {
    const pebble = new THREE.Mesh(geo, rng() > 0.5 ? light : dark);
    pebble.position.set(-27 + rng() * 54, -21 + rng() * 0.3, -9 + rng() * 21);
    pebble.scale.set(0.5 + rng() * 1.1, 0.35 + rng() * 0.5, 0.5 + rng() * 1.1);
    pebble.rotation.y = rng() * Math.PI;
    scene.add(pebble);
  }
}

function makePlankton(THREE, count, seed) {
  const rng = makeRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = -26 + rng() * 52;
    positions[i * 3 + 1] = -18 + rng() * 38;
    positions[i * 3 + 2] = -10 + rng() * 18;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x8cffe6,
    size: 0.42,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
