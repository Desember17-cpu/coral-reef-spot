// rounds.js — the three dives, and how the light changes between them.
//
// The reef is the same reef all day; what changes is the water. Morning is
// bright and kind, noon glares white off the sand, and by the third round the
// reef sits in deep dusk blue where every colour is a neighbour of every
// other — the same twelve-difference hunt, honestly harder. Each round also
// picks a quieter set of differences than the one before, gives the clock
// less time, and trusts the player with fewer hints.

export const ROUNDS = [
  {
    name: 'Morning Reef',
    subtitle: 'first light on the coral garden',
    seconds: 240,
    hints: 3,
    palette: {
      waterTop: '#3fa7c4',
      waterMid: '#1d7ea6',
      waterBottom: '#0b4a70',
      silhouette: '#0a3d5f',
      sandTop: '#e8d193',
      sandBottom: '#c2a15e',
      rayAlpha: 0.16,
      tint: 'rgba(255,255,240,0.05)',
      plankton: 0,
    },
    differences: [
      'ray-missing',
      'starfish-missing',
      'bubble-trail-missing',
      'school-fish-missing',
      'clownfish-missing',
      'amphora-crack',
      'jellyfish-missing',
      'shell-missing',
      'sponge-missing',
      'angelfish-stripe',
      'seahorse-colour',
      'oyster-pearl',
    ],
  },
  {
    name: 'Noon Glare',
    subtitle: 'the sun straight overhead, the sand gone white',
    seconds: 210,
    hints: 2,
    palette: {
      waterTop: '#6fc3d8',
      waterMid: '#2f96b8',
      waterBottom: '#11608c',
      silhouette: '#0d4a6e',
      sandTop: '#f4e5b0',
      sandBottom: '#d3b26c',
      rayAlpha: 0.24,
      tint: 'rgba(255,255,255,0.10)',
      plankton: 0,
    },
    differences: [
      'turtle-scute',
      'staghorn-tips',
      'fan-colour',
      'crab-claw',
      'weed-height',
      'snail-shell',
      'school-fish-missing',
      'bubble-trail-missing',
      'seahorse-colour',
      'sponge-missing',
      'jellyfish-missing',
      'angelfish-stripe',
    ],
  },
  {
    name: 'Deep Dusk',
    subtitle: 'the reef in blue dark, plankton beginning to glow',
    seconds: 180,
    hints: 2,
    palette: {
      waterTop: '#144a75',
      waterMid: '#0c3358',
      waterBottom: '#051e3a',
      silhouette: '#04182e',
      sandTop: '#8a7a52',
      sandBottom: '#5d5138',
      rayAlpha: 0.05,
      tint: 'rgba(6,20,60,0.28)',
      plankton: 90,
    },
    differences: [
      'turtle-scute',
      'fan-colour',
      'staghorn-tips',
      'snail-shell',
      'crab-claw',
      'weed-height',
      'oyster-pearl',
      'shell-missing',
      'clownfish-missing',
      'amphora-crack',
      'starfish-missing',
      'school-fish-missing',
    ],
  },
];
