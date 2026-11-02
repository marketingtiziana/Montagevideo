/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * Même graine => même suite => layout identique à chaque chargement.
 */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Nombre dans [min, max). */
    range: (min: number, max: number) => min + next() * (max - min),
    /** Entier dans [min, max]. */
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
  };
}

/** Graine stable dérivée d'une chaîne (FNV-1a 32 bits). */
export function hashSeed(input: string, base = 2166136261): number {
  let h = base >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
