// RNG deterministik: hash string -> mulberry32.
// Setiap fixture memakai seed "liga:week:homevaway" sehingga laga bisa
// direproduksi persis (replay) dan hasil tidak berubah antar run.

export type Rng = () => number;

/** xfnv1a 32-bit: string sembarang -> integer unsigned. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: PRNG cepat dan cukup untuk simulasi game. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer inklusif [min, max]. */
export function int(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Ambil satu elemen acak. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  const item = arr[Math.floor(rng() * arr.length)];
  if (item === undefined) throw new Error('pick() dari array kosong');
  return item;
}
