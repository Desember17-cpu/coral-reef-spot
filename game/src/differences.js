// differences.js — the catalog of every difference the reef can hide.
//
// Each difference is one designed change to the 3D reef: something
// recoloured, removed, or swapped, applied to the scene by reef-life.js
// between the two panel renders. This file owns each difference's id, its
// anchor (the reef-life registry name reef-scene.js projects into panel
// pixels for markers and hit-testing), its forgiving radius in panel
// pixels, and the words the status line speaks when it is found. Rounds in
// rounds.js pick twelve ids each — early rounds take the honest, visible
// ones, later rounds the quiet ones.

export const DIFFERENCES = {
  'ray-missing': { anchor: 'rays', r: 62, name: 'a missing ray of sunlight' },
  'school-fish-missing': { anchor: 'fishSchool', r: 52, name: 'one fish gone from the school' },
  'jellyfish-missing': { anchor: 'jellyfish', r: 36, name: 'the jellyfish has drifted away' },
  'turtle-scute': { anchor: 'turtle', r: 48, name: "the turtle's shell pattern changed" },
  'angelfish-stripe': { anchor: 'angelfish', r: 48, name: "the angelfish's lost stripe" },
  'bubble-trail-missing': { anchor: 'bubbleVent', r: 32, name: 'the bubble trail has stopped' },
  'seahorse-colour': { anchor: 'seahorse', r: 32, name: 'the seahorse changed colour' },
  'sponge-missing': { anchor: 'tubeSponges', r: 38, name: 'one tube sponge is gone' },
  'fan-colour': { anchor: 'seaFan', r: 50, name: 'the sea fan changed colour' },
  'clownfish-missing': { anchor: 'anemone', r: 48, name: 'one clownfish is missing' },
  'staghorn-tips': { anchor: 'staghorn', r: 54, name: "the staghorn coral's tips changed colour" },
  'weed-height': { anchor: 'seaweed', r: 36, name: 'the tallest seaweed is shorter' },
  'oyster-pearl': { anchor: 'oyster', r: 34, name: 'the oyster has closed on its pearl' },
  'amphora-crack': { anchor: 'amphora', r: 44, name: 'a crack has appeared in the amphora' },
  'starfish-missing': { anchor: 'starfish', r: 36, name: 'the starfish has vanished' },
  'shell-missing': { anchor: 'pinkShell', r: 26, name: 'the pink shell is gone' },
  'crab-claw': { anchor: 'crab', r: 36, name: "the crab's big claw swapped sides" },
  'snail-shell': { anchor: 'snail', r: 26, name: "the snail's shell changed colour" },
};

export function differenceById(id) {
  return DIFFERENCES[id];
}
