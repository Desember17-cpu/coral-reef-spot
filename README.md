[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Desember17-cpu/coral-reef-spot/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Desember17-cpu/coral-reef-spot/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Coral Reef Aquarium — Spot the Difference

Two pictures of one reef hang side by side. Twelve things have changed in the
second picture. Click each change you find — in either picture — before the
light runs out.

An original spot-the-difference game in plain HTML and JavaScript. The reef
is a real 3D scene, modeled and lit in Three.js — corals, an anemone and its
clownfish, a turtle, a sunken amphora, a crab, drifting bubbles — and both
panels are renders of that one scene from the same camera. The right-hand
render simply applies twelve designed changes to the scene first: a stripe
removed, a shell recoloured, a bubble trail gone. It plays offline from its
own files; the only library is Three.js, vendored under `game/vendor/`.

## The three dives

1. **Morning Reef** — first light, 4:00 on the clock, 3 hints. The honest,
   visible differences: a vanished starfish, a stopped bubble trail, a
   missing ray of sun.
2. **Noon Glare** — the sun overhead and the sand gone white, 3:30, 2 hints.
   The differences go quieter: a recoloured scute on the turtle's shell, a
   sea fan turned red, a crab whose big claw swapped sides.
3. **Deep Dusk** — the reef in blue dark with plankton beginning to glow,
   3:00, 2 hints. The quietest set of all, in the hardest light.

## How to play

- **Mouse:** click a difference in either picture. A green ring marks it on
  both. A misclick costs 5 seconds of light.
- **Keyboard:** arrow keys swim a ring over the picture, Tab hops it to the
  other panel, Enter or Space checks where it rests.
- **H** spends a hint — a golden ring breathes around one difference for a
  moment (−25 points). **P** pauses. **M** mutes.
- The counter in the header always says how many differences remain.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output and writes the dossier with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
- `game/index.html` — the page. `game/src/` holds the game, one job a file:
  `reef-world.js` builds the 3D stage (water, light, sand, rocks, god rays),
  `reef-life.js` models the cast and applies each difference to the scene,
  `reef-scene.js` renders the panel pair and projects the differences into
  panel pixels, `differences.js` catalogues what can change, `rounds.js`
  sets the three dives' light, `state.js` keeps the rules, `input.js` the
  hands and keys, `render.js` every frame, `audio.js` the synthesized
  sounds, `shots.js` the staged scenes behind the screenshots.
  `game/vendor/three.min.js` is the Three.js library, vendored.
- `screenshots/` — real renders of the game in a browser: a mid-hunt cover,
  the title screen, the dusk round, and a finished survey.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

## License

MIT — see `LICENSE`.
