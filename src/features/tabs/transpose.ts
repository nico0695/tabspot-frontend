const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
};

const ROOT_REGEX = /^([A-Ga-g])([#b]?)(.*)/;

function shiftRoot(root: string, accidental: string, semitones: number): string {
  const normalized = root.toUpperCase() + accidental;
  const resolved = FLAT_TO_SHARP[normalized] ?? normalized;

  const index = CHROMATIC.indexOf(resolved);
  if (index === -1) return root + accidental;

  const newIndex = (((index + (semitones % 12)) % 12) + 12) % 12;
  return CHROMATIC[newIndex];
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;

  const match = chord.match(ROOT_REGEX);
  if (!match) return chord;

  const [, root, accidental, rest] = match;

  const slashIndex = rest.indexOf('/');
  if (slashIndex !== -1) {
    const quality = rest.slice(0, slashIndex);
    const bassChord = rest.slice(slashIndex + 1);
    const transposedRoot = shiftRoot(root, accidental, semitones);
    const transposedBass = transposeChord(bassChord, semitones);
    return transposedRoot + quality + '/' + transposedBass;
  }

  return shiftRoot(root, accidental, semitones) + rest;
}
