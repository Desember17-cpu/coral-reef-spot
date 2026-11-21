// reef-life.js — everything living or lost in the reef, modeled in 3D.
//
// createLife builds the whole cast into the scene — staghorn and brain
// corals, a sea fan, tube sponges, an anemone with clownfish, seaweed, the
// turtle, the angelfish, a fish school, a jellyfish, a seahorse, a crab, a
// snail, an oyster with its pearl, a starfish, a pink shell, the sunken
// amphora and the bubble trail leaking from its neck — and returns two
// things: the anchor objects reef-scene.js projects into panel pixels, and
// setDifference(id, on), the one place each designed difference is applied
// to the scene (a stripe's mesh hidden, a shell material recoloured, a lid
// swung shut). Both panels are renders of this one scene; the difference
// set is the only thing that changes between them.

export function createLife(THREE, scene) {
  const anchors = {};
  const mutations = {};
  const add = (name, group) => {
    scene.add(group);
    anchors[name] = group;
    return group;
  };

  buildStaghorn(THREE, add, mutations);
  buildBrainCoral(THREE, add);
  buildSeaFan(THREE, add, mutations);
  buildTubeSponges(THREE, add, mutations);
  buildAnemoneAndClownfish(THREE, add, mutations);
  buildSeaweed(THREE, add, mutations);
  buildTurtle(THREE, add, mutations);
  buildAngelfish(THREE, add, mutations);
  buildFishSchool(THREE, add, mutations);
  buildJellyfish(THREE, add, mutations);
  buildSeahorse(THREE, add, mutations);
  buildAmphora(THREE, add, mutations);
  buildOyster(THREE, add, mutations);
  buildStarfish(THREE, add, mutations);
  buildPinkShell(THREE, add, mutations);
  buildCrab(THREE, add, mutations);
  buildSnail(THREE, add, mutations);
  buildBubbleTrail(THREE, add, mutations);

  return {
    anchors,
    setDifference(id, on) {
      const mutate = mutations[id];
      if (mutate) mutate(on);
    },
  };
}

function mat(THREE, color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, ...opts });
}

function limb(THREE, from, to, rBottom, rTop, material) {
  // A cylinder stretched between two points: branches, stalks, legs.
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, len, 7), material);
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function buildStaghorn(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-13, -12.3, 0);
  const branchMat = mat(THREE, 0xe07856, { roughness: 0.9 });
  const tipsMat = mat(THREE, 0xff5d8f, { roughness: 0.6 });
  const tips = [];
  const grow = (pos, dir, len, rad, depth) => {
    const end = pos.clone().addScaledVector(dir, len);
    group.add(limb(THREE, pos, end, rad, rad * 0.72, branchMat));
    if (depth <= 1) {
      const tip = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.25, 10, 8), tipsMat);
      tip.position.copy(end);
      group.add(tip);
      tips.push(tip);
    }
    if (depth === 0) return;
    const kids = depth === 3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const nd = dir.clone();
      nd.x += Math.sin(k * 2.4 + depth * 1.7) * 0.55;
      nd.z += Math.cos(k * 1.9 + depth) * 0.4;
      nd.y += 0.25;
      nd.normalize();
      grow(end, nd, len * 0.7, rad * 0.68, depth - 1);
    }
  };
  grow(new THREE.Vector3(0, -7, 0), new THREE.Vector3(0.1, 1, 0.05).normalize(), 4.6, 0.85, 3);
  grow(new THREE.Vector3(-1.6, -7, 0.4), new THREE.Vector3(-0.45, 1, 0.1).normalize(), 3.8, 0.7, 2);
  grow(new THREE.Vector3(1.8, -7, -0.3), new THREE.Vector3(0.5, 1, -0.08).normalize(), 3.6, 0.65, 2);
  mutations['staghorn-tips'] = (on) => tipsMat.color.set(on ? 0xff9f2e : 0xff5d8f);
  add('staghorn', group);
}

function buildBrainCoral(THREE, add) {
  const group = new THREE.Group();
  group.position.set(-3.85, -18.4, -1);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = '#c98a6b';
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = 'rgba(122,66,44,0.75)';
  g.lineWidth = 3;
  for (let row = 0; row < 7; row++) {
    g.beginPath();
    for (let x = 0; x <= 256; x += 8) {
      const y = 12 + row * 17 + Math.sin(x * 0.09 + row * 2.2) * 4;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(4.8, 26, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }),
  );
  dome.scale.y = 0.72;
  group.add(dome);
  add('brainCoral', group);
}

function buildSeaFan(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-3, -5.6, -3);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 7.4, 7), mat(THREE, 0x7a4a3a));
  stem.position.y = -4.6;
  group.add(stem);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(255,255,255,0.95)';
  g.lineWidth = 5;
  for (let i = -5; i <= 5; i++) {
    g.beginPath();
    g.moveTo(128, 250);
    g.quadraticCurveTo(128 + i * 13, 140, 128 + i * 24, 26 + Math.abs(i) * 9);
    g.stroke();
  }
  g.lineWidth = 3.4;
  for (let r = 26; r <= 118; r += 17) {
    g.beginPath();
    g.arc(128, 246, r, Math.PI * 1.12, Math.PI * 1.88);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  const fanMat = new THREE.MeshStandardMaterial({
    map: tex,
    color: 0x9b6dd6,
    transparent: true,
    alphaTest: 0.3,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });
  const fan = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 10), fanMat);
  fan.position.y = 2.2;
  group.add(fan);
  mutations['fan-colour'] = (on) => fanMat.color.set(on ? 0xd94f5c : 0x9b6dd6);
  add('seaFan', group);
}

function buildTubeSponges(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(18.6, -13.2, -2);
  const spongeMat = mat(THREE, 0xe0a458, { roughness: 0.95 });
  const mouthMat = mat(THREE, 0x8a5a24);
  const tubes = [];
  const specs = [
    { x: -2.7, h: 5.2, r: 1.15 },
    { x: 0.2, h: 7.6, r: 1.35 },
    { x: 2.9, h: 4.2, r: 1.0 },
  ];
  for (const s of specs) {
    const tube = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(s.r * 0.82, s.r, s.h, 12, 1, true), spongeMat);
    body.position.y = s.h / 2 - 3.4;
    tube.add(body);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(s.r * 0.8, 14), mouthMat);
    mouth.rotation.x = -Math.PI / 2;
    mouth.position.y = s.h - 3.4;
    tube.add(mouth);
    tube.position.x = s.x;
    group.add(tube);
    tubes.push(tube);
  }
  mutations['sponge-missing'] = (on) => { tubes[2].visible = !on; };
  add('tubeSponges', group);
}

function miniFish(THREE, color, band) {
  const fish = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat(THREE, color, { roughness: 0.6 }));
  body.scale.set(1.6, 0.85, 0.55);
  fish.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.1, 8), mat(THREE, color, { roughness: 0.6 }));
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -1.95;
  fish.add(tail);
  if (band) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.5, 1.05), mat(THREE, 0xffffff, { roughness: 0.5 }));
    stripe.position.x = 0.15;
    fish.add(stripe);
  }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(THREE, 0x20303c));
  eye.position.set(1.15, 0.18, 0.5);
  fish.add(eye);
  return fish;
}

function buildAnemoneAndClownfish(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(18.4, -16.4, 1.5);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.3, 1.8, 14), mat(THREE, 0xc65b8f));
  base.position.y = -2.9;
  group.add(base);
  const stalkMat = mat(THREE, 0xf28bb4, { roughness: 0.7 });
  const tipMat = mat(THREE, 0xffd3e6, { roughness: 0.5 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const ring = i % 3 === 0 ? 0.7 : 1.9;
    const from = new THREE.Vector3(Math.cos(a) * ring, -2.2, Math.sin(a) * ring);
    const to = new THREE.Vector3(Math.cos(a) * (ring + 0.9), -0.4 + (i % 4) * 0.22, Math.sin(a) * (ring + 0.9));
    group.add(limb(THREE, from, to, 0.17, 0.13, stalkMat));
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), tipMat);
    tip.position.copy(to);
    group.add(tip);
  }
  const clowns = [];
  const spots = [[-1.6, 0.6, 0.8], [1.9, 1.1, -0.5], [0.1, 0.1, 1.6]];
  for (const [x, y, z] of spots) {
    const clown = miniFish(THREE, 0xff7b33, true);
    clown.position.set(x, y, z);
    clown.rotation.y = 0.5 + x * 0.2;
    group.add(clown);
    clowns.push(clown);
  }
  mutations['clownfish-missing'] = (on) => { clowns[2].visible = !on; };
  add('anemone', group);
}

function buildSeaweed(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(0.5, -14.6, 1);
  const weedMat = mat(THREE, 0x2e8b57, { roughness: 0.8 });
  const strands = [
    { dx: -1.7, h: 9.6, lean: -1.5 },
    { dx: 0, h: 13.2, lean: 0.9 },
    { dx: 1.6, h: 8.4, lean: 1.9 },
    { dx: -3, h: 6.2, lean: -2.3 },
    { dx: 2.9, h: 5.6, lean: 2.7 },
  ];
  let tallest = null;
  for (const s of strands) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(s.dx, -6.8, 0),
      new THREE.Vector3(s.dx + s.lean * 0.4, -6.8 + s.h * 0.55, 0),
      new THREE.Vector3(s.dx + s.lean, -6.8 + s.h, 0),
    );
    const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.34, 6), weedMat);
    // Scale about the strand's base for the weed-height difference.
    strand.geometry.translate(0, 0, 0);
    group.add(strand);
    if (s.h === 13.2) tallest = strand;
  }
  // The tallest strand shrinks toward its base: scale about the group
  // origin would lift its roots out of the sand, so the pivot compensates.
  mutations['weed-height'] = (on) => {
    if (!tallest) return;
    tallest.scale.y = on ? 0.52 : 1;
    tallest.position.y = on ? -3.26 : 0;
  };
  add('seaweed', group);
}

function buildTurtle(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(2.45, 12, -1);
  group.rotation.y = -0.35;
  const skinMat = mat(THREE, 0x6a9a5b, { roughness: 0.8 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(4.7, 24, 16), mat(THREE, 0x7fae56, { roughness: 0.85 }));
  shell.scale.set(1.25, 0.6, 1);
  group.add(shell);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(4.85, 24, 12), mat(THREE, 0x5d8a43, { roughness: 0.9 }));
  rim.scale.set(1.25, 0.42, 1);
  rim.position.y = -0.5;
  group.add(rim);
  const scuteMat = mat(THREE, 0x8fbc63, { roughness: 0.8 });
  const centreMat = mat(THREE, 0x8fbc63, { roughness: 0.8 });
  const scutes = [
    { p: [0, 2.55, 0], r: 1.65, centre: true },
    { p: [-2.9, 2.1, -1.4], r: 1.3 },
    { p: [2.9, 2.1, -1.4], r: 1.3 },
    { p: [-3, 2, 1.5], r: 1.3 },
    { p: [3, 2, 1.5], r: 1.3 },
    { p: [0, 2.3, -2.6], r: 1.15 },
    { p: [0, 2.3, 2.6], r: 1.15 },
  ];
  for (const s of scutes) {
    const scute = new THREE.Mesh(new THREE.SphereGeometry(s.r, 12, 8), s.centre ? centreMat : scuteMat);
    scute.scale.y = 0.45;
    scute.position.set(...s.p);
    group.add(scute);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), skinMat);
  head.position.set(6.4, 0.3, 0);
  group.add(head);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), mat(THREE, 0x20303c));
    eye.position.set(7.1, 0.75, side * 0.72);
    group.add(eye);
    const front = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skinMat);
    front.scale.set(2.1, 0.42, 1);
    front.position.set(3.6, -0.9, side * 3.6);
    front.rotation.y = side * 0.5;
    group.add(front);
    const back = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), skinMat);
    back.scale.set(1.7, 0.4, 0.9);
    back.position.set(-3.8, -0.9, side * 3.4);
    back.rotation.y = -side * 0.5;
    group.add(back);
  }
  mutations['turtle-scute'] = (on) => centreMat.color.set(on ? 0xc9a227 : 0x8fbc63);
  add('turtle', group);
}

function buildAngelfish(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-11.2, 7.3, 1);
  const shape = new THREE.Shape();
  shape.moveTo(-3.6, 0);
  shape.quadraticCurveTo(-3.2, 3.6, 0.2, 4.5);
  shape.quadraticCurveTo(3, 3.4, 3.4, 0.4);
  shape.quadraticCurveTo(3, -3.2, 0.2, -4.5);
  shape.quadraticCurveTo(-3.2, -3.4, -3.6, 0);
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.85, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.18, bevelSegments: 1 }),
    mat(THREE, 0xf4f1de, { roughness: 0.55 }),
  );
  body.position.z = -0.42;
  group.add(body);
  const finMat = mat(THREE, 0xe9e4c8, { roughness: 0.6 });
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 1.6);
  tailShape.lineTo(-2.4, 2.6);
  tailShape.lineTo(-2, 0);
  tailShape.lineTo(-2.4, -2.6);
  tailShape.lineTo(0, -1.6);
  tailShape.closePath();
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(tailShape, { depth: 0.4, bevelEnabled: false }), finMat);
  tail.position.set(-3.4, 0, -0.2);
  group.add(tail);
  const stripeMat = mat(THREE, 0x264653, { roughness: 0.5 });
  const stripes = [];
  for (const sx of [-1.5, 0.35, 2]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.85, 6.9 - Math.abs(sx) * 0.9, 0.3), stripeMat);
    stripe.position.set(sx, 0, 0.62);
    stripe.rotation.z = 0.06;
    group.add(stripe);
    stripes.push(stripe);
  }
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.4, 0.3), mat(THREE, 0xffb703, { roughness: 0.5 }));
  face.position.set(2.85, -0.1, 0.62);
  group.add(face);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat(THREE, 0x20303c));
  eye.position.set(2.3, 1.15, 0.95);
  group.add(eye);
  mutations['angelfish-stripe'] = (on) => { stripes[1].visible = !on; };
  add('angelfish', group);
}

function buildFishSchool(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(9.45, 16.9, -2);
  const spots = [[0, 0, 0], [3.4, -1.4, -0.6], [3.6, 1.6, 0.5], [7, -0.4, -0.3], [7.2, 2.6, 0.4], [10.4, 0.8, -0.5], [10.6, -2, 0.3]];
  const fish = [];
  for (const [x, y, z] of spots) {
    const f = miniFish(THREE, 0xffd166, false);
    f.position.set(x, y, z);
    f.scale.setScalar(0.92);
    group.add(f);
    fish.push(f);
  }
  mutations['school-fish-missing'] = (on) => { fish[6].visible = !on; };
  add('fishSchool', group);
}

function buildJellyfish(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(17.4, 14.6, -3);
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xf0aade, roughness: 0.35, transparent: true, opacity: 0.6, emissive: 0x90386e, emissiveIntensity: 0.25,
  });
  const bell = new THREE.Mesh(new THREE.SphereGeometry(2.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), bellMat);
  group.add(bell);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.25, 12, 8), mat(THREE, 0xffd2f0, { roughness: 0.4 }));
  core.position.y = 0.5;
  group.add(core);
  const tentMat = mat(THREE, 0xf0aade, { roughness: 0.5, transparent: true, opacity: 0.75 });
  for (let i = -2; i <= 2; i++) {
    const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 4.6 - Math.abs(i) * 0.5, 5), tentMat);
    tent.position.set(i * 0.85, -2.4 + Math.abs(i) * 0.2, (i % 2) * 0.4);
    group.add(tent);
  }
  mutations['jellyfish-missing'] = (on) => { group.visible = !on; };
  add('jellyfish', group);
}

function buildSeahorse(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-17.2, -1.1, 2);
  const horseMat = mat(THREE, 0xf2c230, { roughness: 0.6 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 3.6, 0),
    new THREE.Vector3(-0.9, 1.7, 0),
    new THREE.Vector3(-0.2, -0.5, 0),
    new THREE.Vector3(0.75, -2.3, 0),
    new THREE.Vector3(-0.3, -3.6, 0),
    new THREE.Vector3(-1.5, -3, 0),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.58, 8), horseMat));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), horseMat);
  head.position.set(0.55, 4, 0);
  head.scale.set(1.25, 0.85, 0.8);
  group.add(head);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.3, 8), horseMat);
  snout.rotation.z = Math.PI / 2 - 0.25;
  snout.position.set(1.6, 3.85, 0);
  group.add(snout);
  for (const a of [-0.5, 0, 0.5]) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), horseMat);
    spike.position.set(0.1 + Math.sin(a) * 0.5, 4.85, 0);
    spike.rotation.z = -a * 0.7;
    group.add(spike);
  }
  const fin = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xf2c230, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  fin.position.set(-1.05, 0.9, -0.2);
  fin.rotation.y = 0.6;
  group.add(fin);
  mutations['seahorse-colour'] = (on) => horseMat.color.set(on ? 0x5dbb63 : 0xf2c230);
  add('seahorse', group);
}

function buildAmphora(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(13.4, -17.4, 4);
  group.rotation.z = 0.92; // tipped on its side in the sand, neck up-left
  const clayMat = mat(THREE, 0xb56545, { roughness: 0.9 });
  const profile = [
    [0.01, 0], [1.7, 0.25], [2.5, 1.1], [2.85, 2.5], [2.5, 4.1], [1.25, 5.1], [1.05, 6.1], [1.5, 6.6], [1.5, 7],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const pot = new THREE.Mesh(new THREE.LatheGeometry(profile, 22), clayMat);
  pot.position.y = -3.4;
  group.add(pot);
  const bandMat = mat(THREE, 0x8a4630, { roughness: 0.9 });
  for (const by of [-1.2, 0.6, 2.2]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.62 - Math.abs(by) * 0.22, 0.13, 6, 24), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = by;
    group.add(band);
  }
  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.27, 8, 14, Math.PI), clayMat);
    handle.position.set(side * 1.5, 2.2, 0);
    handle.rotation.z = side * -0.5;
    group.add(handle);
  }
  // The crack: a jagged seam of thin dark boxes across the belly, present
  // only when the difference is on.
  const crack = new THREE.Group();
  const crackMat = mat(THREE, 0x1e100a, { roughness: 1 });
  const links = [[-0.5, 1.4], [0.3, 0.4], [-0.25, -0.6], [0.4, -1.6], [0.05, -2.6]];
  links.forEach(([x, y], i) => {
    if (i === 0) return;
    const [px, py] = links[i - 1];
    const seg = limb(THREE, new THREE.Vector3(px, py, 2.62), new THREE.Vector3(x, y, 2.66), 0.09, 0.09, crackMat);
    crack.add(seg);
  });
  crack.visible = false;
  group.add(crack);
  mutations['amphora-crack'] = (on) => { crack.visible = on; };
  add('amphora', group);
}

function buildOyster(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-12.5, -19.4, 3);
  const shellMat = mat(THREE, 0x8d7d99, { roughness: 0.95 });
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(2.7, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), shellMat);
  bottom.scale.y = 0.6;
  group.add(bottom);
  const pearl = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xfdf4ec, roughness: 0.15, metalness: 0.1 }),
  );
  pearl.position.set(0.3, 0.35, 0.5);
  group.add(pearl);
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.3, -1.6);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(2.7, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(THREE, 0xa08cae, { roughness: 0.95 }));
  lid.scale.y = 0.6;
  lid.position.z = 1.6;
  lidPivot.add(lid);
  lidPivot.rotation.x = -0.8; // open, showing the pearl
  group.add(lidPivot);
  mutations['oyster-pearl'] = (on) => {
    lidPivot.rotation.x = on ? -0.05 : -0.8;
    pearl.visible = !on;
  };
  add('oyster', group);
}

function buildStarfish(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(11.1, -20.1, 5);
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 2.7 : 1.15;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  shape.closePath();
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 1 }), mat(THREE, 0xf59e4c, { roughness: 0.8 }));
  star.rotation.x = -Math.PI / 2;
  group.add(star);
  const dotMat = mat(THREE, 0xd97c26);
  for (const [x, z] of [[0, 0], [-1.1, -0.6], [1.1, -0.6], [-0.7, 0.9], [0.8, 0.9], [0, -1.3]]) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), dotMat);
    dot.position.set(x, 0.62, z);
    group.add(dot);
  }
  mutations['starfish-missing'] = (on) => { group.visible = !on; };
  add('starfish', group);
}

function buildPinkShell(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-8.4, -20.2, 5);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 10), mat(THREE, 0xf2a7bb, { roughness: 0.55 }));
  shell.scale.set(1, 0.78, 1);
  group.add(shell);
  const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.2, 8, 16), mat(THREE, 0xd97b9b, { roughness: 0.55 }));
  swirl.rotation.x = Math.PI / 2;
  swirl.position.y = 0.75;
  group.add(swirl);
  mutations['shell-missing'] = (on) => { group.visible = !on; };
  add('pinkShell', group);
}

function buildCrab(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(3.5, -20.1, 5);
  const bodyMat = mat(THREE, 0xe4572e, { roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.9, 16, 12), bodyMat);
  body.scale.set(1.3, 0.72, 0.95);
  group.add(body);
  const legMat = mat(THREE, 0xd1495b, { roughness: 0.7 });
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 3; leg++) {
      group.add(limb(
        THREE,
        new THREE.Vector3(side * 1.7, -0.3, -0.5 + leg * 0.55),
        new THREE.Vector3(side * (3 + leg * 0.5), -1.15, -0.7 + leg * 0.7),
        0.16, 0.09, legMat,
      ));
    }
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 6), legMat);
    stalk.position.set(side * 0.7, 1.15, 0.9);
    group.add(stalk);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), mat(THREE, 0x20303c));
    eye.position.set(side * 0.75, 1.65, 0.95);
    group.add(eye);
  }
  const clawMat = mat(THREE, 0xd1495b, { roughness: 0.65 });
  const makeClaw = (side) => {
    const claw = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), clawMat);
    palm.scale.set(1.15, 0.9, 0.9);
    claw.add(palm);
    const finger = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 8), clawMat);
    finger.position.set(side * 0.55, 0.55, 0.2);
    finger.rotation.z = -side * 0.7;
    claw.add(finger);
    claw.position.set(side * 3.1, 0.1, 1.1);
    return claw;
  };
  const clawL = makeClaw(-1);
  const clawR = makeClaw(1);
  clawL.scale.setScalar(1.3); // the left claw starts big
  clawR.scale.setScalar(0.72);
  group.add(clawL);
  group.add(clawR);
  mutations['crab-claw'] = (on) => {
    clawL.scale.setScalar(on ? 0.72 : 1.3);
    clawR.scale.setScalar(on ? 1.3 : 0.72);
  };
  add('crab', group);
}

function buildSnail(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(-4.6, -20.2, 5);
  const bodyMat = mat(THREE, 0xa8c686, { roughness: 0.8 });
  const foot = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), bodyMat);
  foot.scale.set(1.5, 0.42, 0.7);
  foot.position.y = 0.1;
  group.add(foot);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), bodyMat);
  head.position.set(1.9, 0.55, 0);
  group.add(head);
  for (const dz of [-0.22, 0.22]) {
    group.add(limb(THREE, new THREE.Vector3(2, 0.8, dz), new THREE.Vector3(2.35, 1.6, dz * 1.6), 0.07, 0.05, bodyMat));
  }
  const spiralTexture = (base, line) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const g = canvas.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = line;
    g.lineWidth = 6;
    g.beginPath();
    for (let t = 0; t < Math.PI * 5.4; t += 0.15) {
      const r = 3 + t * 3.4;
      const x = 64 + Math.cos(t) * r;
      const y = 64 + Math.sin(t) * r;
      if (t === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    return new THREE.CanvasTexture(canvas);
  };
  const tealTex = spiralTexture('#2a9d8f', 'rgba(16,54,48,0.8)');
  const violetTex = spiralTexture('#9b6dd6', 'rgba(52,30,86,0.8)');
  const shellMat = new THREE.MeshStandardMaterial({ map: tealTex, roughness: 0.6 });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), shellMat);
  shell.position.set(-0.3, 1.25, 0);
  group.add(shell);
  mutations['snail-shell'] = (on) => {
    shellMat.map = on ? violetTex : tealTex;
    shellMat.needsUpdate = true;
  };
  add('snail', group);
}

function buildBubbleTrail(THREE, add, mutations) {
  const group = new THREE.Group();
  group.position.set(14.2, -2, 2);
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.38,
  });
  for (let i = 0; i < 11; i++) {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.2 + ((i * 29) % 5) * 0.09, 10, 8), bubbleMat);
    bubble.position.set(Math.sin(i * 1.7) * 0.8 + i * 0.09, -9.5 + i * 1.85, (i % 3) * 0.3);
    group.add(bubble);
  }
  mutations['bubble-trail-missing'] = (on) => { group.visible = !on; };
  add('bubbleVent', group);
}
