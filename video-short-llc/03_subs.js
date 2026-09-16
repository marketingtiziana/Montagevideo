#!/usr/bin/env node
/**
 * 03_subs.js — Génère subs.ass (karaoké mot à mot, style TikTok) depuis timestamps.json.
 *
 * Principe : les mots sont regroupés en "cartes" de N mots. Pour chaque mot,
 * une ligne Dialogue couvre sa durée et affiche toute la carte, le mot actif
 * étant surligné en jaune (et légèrement agrandi).
 *
 * Sortie : subs.ass
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, ensureDirs, loadConfig, readJson, log, fileExists, fmtDuration,
} from './lib/util.js';
import { groupIntoCards } from './lib/words.js';

/** Secondes → 0:00:00.00 (centisecondes, format ASS). */
function assTime(seconds) {
  const t = Math.max(0, seconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const cs = Math.round((t - Math.floor(t)) * 100);
  // Un arrondi à 100 cs doit remonter sur la seconde.
  if (cs === 100) return assTime(Math.floor(t) + 1);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/** Échappe les caractères spéciaux ASS. */
function assEscape(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, ' ');
}

function buildHeader(cfg) {
  const s = cfg.subs;
  const v = cfg.video;
  return [
    '[Script Info]',
    `; Généré par 03_subs.js`,
    'ScriptType: v4.00+',
    `PlayResX: ${v.width}`,
    `PlayResY: ${v.height}`,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    'YCbCr Matrix: TV.709',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    [
      'Style: Karaoke',
      s.fontName,
      s.fontSize,
      s.primaryColour,
      s.highlightColour,
      s.outlineColour,
      '&H64000000',
      '-1', '0', '0', '0',
      '100', '100', '0', '0',
      '1',
      s.outline, s.shadow,
      s.alignment,
      s.marginL, s.marginR, s.marginV,
      '1',
    ].join(','),
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ].join('\n');
}

function renderCard(card, activeIndex, cfg) {
  const s = cfg.subs;
  const parts = card.map((w, i) => {
    const raw = s.uppercase ? w.word.toLocaleUpperCase('fr-FR') : w.word;
    const text = assEscape(raw);
    if (i !== activeIndex) return text;
    // Mot actif : couleur de surbrillance + léger "pop".
    return `{\\c${s.highlightColour}\\fscx108\\fscy108}${text}{\\c${s.primaryColour}\\fscx100\\fscy100}`;
  });
  return parts.join(' ');
}

function main() {
  ensureDirs();
  const cfg = loadConfig();

  if (!fileExists('timestamps.json')) {
    log.err('timestamps.json introuvable — lance d\'abord `node 01_voice.js`.');
    process.exit(1);
  }

  const data = readJson('timestamps.json');
  const words = data.words || [];
  if (!words.length) {
    log.err('Aucun mot dans timestamps.json.');
    process.exit(1);
  }

  log.step(`Sous-titres — ${words.length} mots`);

  const cards = groupIntoCards(words, {
    wordsPerCard: cfg.subs.wordsPerCard,
    maxWordGapSeconds: cfg.subs.maxWordGapSeconds,
  });

  const lines = [buildHeader(cfg)];
  let events = 0;

  for (const card of cards) {
    for (let i = 0; i < card.length; i++) {
      const w = card[i];
      // La dernière ligne d'une carte tient jusqu'au mot suivant pour éviter
      // les clignotements entre deux cartes proches.
      const isLast = i === card.length - 1;
      const next = card[i + 1];
      const end = isLast ? w.end : Math.max(w.end, next.start);

      if (end <= w.start) continue;

      lines.push(
        `Dialogue: 0,${assTime(w.start)},${assTime(end)},Karaoke,,0,0,0,,${renderCard(card, i, cfg)}`,
      );
      events++;
    }
  }

  const out = path.join(ROOT, 'subs.ass');
  fs.writeFileSync(out, lines.join('\n') + '\n');

  log.ok(`subs.ass — ${cards.length} cartes, ${events} lignes`);
  log.info(`couverture : ${fmtDuration(words[0].start)} → ${fmtDuration(words[words.length - 1].end)}`);
}

main();
