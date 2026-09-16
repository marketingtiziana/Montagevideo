/**
 * ElevenLabs `/with-timestamps` renvoie un alignement AU CARACTÈRE, pas au mot.
 * Ce module reconstruit des mots exploitables pour le karaoké.
 */

/**
 * @param {{characters: string[], character_start_times_seconds: number[], character_end_times_seconds: number[]}} alignment
 * @returns {{word: string, start: number, end: number}[]}
 */
export function alignmentToWords(alignment) {
  if (!alignment || !Array.isArray(alignment.characters)) {
    throw new Error("Alignement ElevenLabs absent ou malformé");
  }
  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;

  if (chars.length !== starts.length || chars.length !== ends.length) {
    throw new Error("Alignement incohérent : longueurs caractères/temps différentes");
  }

  const words = [];
  let buf = '';
  let start = null;
  let end = null;

  const flush = () => {
    if (!buf) return;
    // Un mot uniquement composé de ponctuation est rattaché au mot précédent.
    const isPunctOnly = !/[\p{L}\p{N}]/u.test(buf);
    if (isPunctOnly && words.length > 0) {
      words[words.length - 1].word += buf;
      words[words.length - 1].end = Math.max(words[words.length - 1].end, end);
    } else {
      words.push({ word: buf, start, end });
    }
    buf = '';
    start = null;
    end = null;
  };

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    if (buf === '') start = starts[i];
    buf += c;
    end = ends[i];
  }
  flush();

  // Garde-fou : temps monotones et durée non nulle.
  for (let i = 0; i < words.length; i++) {
    if (!Number.isFinite(words[i].start)) words[i].start = i > 0 ? words[i - 1].end : 0;
    if (!Number.isFinite(words[i].end) || words[i].end <= words[i].start) {
      words[i].end = words[i].start + 0.12;
    }
    if (i > 0 && words[i].start < words[i - 1].end) {
      words[i].start = words[i - 1].end;
      if (words[i].end <= words[i].start) words[i].end = words[i].start + 0.12;
    }
  }

  return words;
}

/** Décale tous les mots d'un offset global (concaténation des segments). */
export function offsetWords(words, offset) {
  return words.map((w) => ({ ...w, start: w.start + offset, end: w.end + offset }));
}

/**
 * Regroupe les mots en "cartes" de sous-titres (N mots max, coupées sur les
 * silences et la ponctuation forte) pour un rendu TikTok lisible.
 */
export function groupIntoCards(words, { wordsPerCard = 4, maxWordGapSeconds = 0.6 } = {}) {
  const cards = [];
  let current = [];

  const flush = () => {
    if (current.length) cards.push(current);
    current = [];
  };

  for (let i = 0; i < words.length; i++) {
    current.push(words[i]);

    const atLimit = current.length >= wordsPerCard;
    const endsSentence = /[.!?:]["')\]]?$/.test(words[i].word);
    const nextGap = i + 1 < words.length ? words[i + 1].start - words[i].end : 0;
    const bigGap = nextGap >= maxWordGapSeconds;

    if (atLimit || endsSentence || bigGap) flush();
  }
  flush();

  return cards;
}
