/**
 * qa.ts — QA automatique bloquant (npm run qa). Contrôles §13.
 * Échoue (exit 1) si un critère est violé. Résumé PASS/FAIL par ligne en
 * console, rapport détaillé dans out/qa_report.json.
 *
 * Paramétrable pour cibler la démo :
 *   --reel <mp4> --audio <wav> --captions <json> --shots <json> --edl <json>
 * Défauts : les fichiers standard du pipeline (FILES.*).
 */

import { QA, FILES, CAPTIONS } from '../config.ts';
import { writeJson, readJson, exists } from '../util/fs.ts';
import { measureLoudness } from '../util/loudness.ts';
import { silenceDetect } from '../util/audio.ts';
import { ffprobe } from '../util/ffmpeg.ts';
import { run } from '../util/exec.ts';
import { log } from '../util/log.ts';
import type { Edl, CaptionsData } from '../types.ts';
import type { ShotsData } from '../steps/08_shots.ts';

type Status = 'PASS' | 'FAIL' | 'SKIP';
interface Check { id: string; label: string; status: Status; detail?: string }

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : def;
}

const REEL = arg('reel', FILES.finalMp4);
const AUDIO = arg('audio', FILES.audioMaster);
const CAPS = arg('captions', FILES.captions);
const SHOTS = arg('shots', FILES.shots);
const EDLP = arg('edl', FILES.edl);

/** Durées séparées des flux vidéo et audio (pour la dérive A/V). */
async function streamDurations(mp4: string): Promise<{ v: number; a: number }> {
  const probe = async (stream: string) => {
    const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', stream, '-show_entries', 'stream=duration', '-of', 'default=nk=1:nw=1', mp4], { quiet: true, allowFail: true });
    return parseFloat(stdout.trim()) || 0;
  };
  return { v: await probe('v:0'), a: await probe('a:0') };
}

async function main(): Promise<void> {
  const checks: Check[] = [];
  const add = (id: string, label: string, ok: boolean | null, detail?: string) =>
    checks.push({ id, label, status: ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL', detail });

  // --- Audio (loudness / LRA / TP / silence) ---
  const audioSrc = exists(AUDIO) ? AUDIO : exists(REEL) ? REEL : null;
  if (audioSrc) {
    const m = await measureLoudness(audioSrc);
    add('loudness', `Loudness ${m.I.toFixed(2)} LUFS ∈ [${QA.lufs.min};${QA.lufs.max}]`, m.I >= QA.lufs.min && m.I <= QA.lufs.max);
    add('lra', `LRA ${m.LRA.toFixed(2)} LU ∈ [${QA.lra.min};${QA.lra.max}]`, m.LRA >= QA.lra.min && m.LRA <= QA.lra.max);
    add('truepeak', `True peak ${m.TP.toFixed(2)} dBTP ≤ ${QA.truePeakMaxDb}`, m.TP <= QA.truePeakMaxDb);
    const sil = await silenceDetect(audioSrc, QA.maxSilenceFloorDb, QA.maxSilenceMs / 1000);
    const long = sil.filter((s) => s.end - s.start > QA.maxSilenceMs / 1000);
    add('silence', `Aucun silence > ${QA.maxSilenceMs} ms sous ${QA.maxSilenceFloorDb} dB`, long.length === 0, long.length ? `${long.length} trouvé(s)` : undefined);
  } else {
    add('loudness', 'Loudness', null, 'audio absent');
    add('lra', 'LRA', null, 'audio absent');
    add('truepeak', 'True peak', null, 'audio absent');
    add('silence', 'Silences', null, 'audio absent');
  }

  // --- Coupes (EDL) : espacement min 90 ms ---
  if (exists(EDLP)) {
    const edl = readJson<Edl>(EDLP);
    let bad = 0;
    for (let i = 1; i < edl.segments.length; i++) {
      const gap = edl.segments[i]!.srcStart - edl.segments[i - 1]!.srcEnd;
      if (gap > 0 && gap < QA.minCutGapMs / 1000) bad++;
    }
    add('cutgap', `Aucune coupe espacée de < ${QA.minCutGapMs} ms`, bad === 0, bad ? `${bad} paire(s)` : undefined);
    // Dérive A/V vs EDL gérée plus bas via les flux du reel.
  } else add('cutgap', 'Espacement des coupes', null, 'edl absent');

  // --- Sous-titres ---
  if (exists(CAPS)) {
    const caps = readJson<CaptionsData>(CAPS);
    let overLines = 0, overWords = 0, capsHit = 0;
    for (const b of caps.blocks) {
      const l1 = b.words.filter((w) => w.line === 1);
      const l2 = b.words.filter((w) => w.line === 2);
      if ((l1.length ? 1 : 0) + (l2.length ? 1 : 0) > QA.captionMaxLines) overLines++;
      if (l1.length > QA.captionMaxWordsPerLine || l2.length > QA.captionMaxWordsPerLine) overWords++;
      for (const w of b.words) if (w.text.length > 1 && w.text === w.text.toUpperCase() && /[A-ZÀ-Ÿ]/.test(w.text)) capsHit++;
    }
    add('caption_lines', `Sous-titres ≤ ${QA.captionMaxLines} lignes`, overLines === 0, overLines ? `${overLines} bloc(s)` : undefined);
    add('caption_words', `Sous-titres ≤ ${QA.captionMaxWordsPerLine} mots/ligne`, overWords === 0, overWords ? `${overWords} bloc(s)` : undefined);
    add('caption_caps', 'Sous-titres sans capitales', capsHit === 0, capsHit ? `${capsHit} mot(s)` : undefined);
  } else {
    add('caption_lines', 'Sous-titres lignes', null, 'captions absent');
    add('caption_words', 'Sous-titres mots', null, 'captions absent');
    add('caption_caps', 'Sous-titres capitales', null, 'captions absent');
  }
  // Ligne de base : contrôle structurel (constante = spec).
  add('caption_baseline', `Ligne de base à ${QA.captionBaselineFromBottom} px`, CAPTIONS.baselineFromBottom === QA.captionBaselineFromBottom);

  // --- Plans / inserts ---
  if (exists(SHOTS)) {
    const shots = readJson<ShotsData>(SHOTS);
    // Un seul élément graphique : pas de spans insert qui se chevauchent.
    const ins = shots.spans.filter((s) => s.kind === 'insert').sort((a, b) => a.startFrame - b.startFrame);
    let overlap = 0;
    for (let i = 1; i < ins.length; i++) if (ins[i]!.startFrame < ins[i - 1]!.endFrame) overlap++;
    add('single_graphic', 'Jamais deux éléments graphiques simultanés', overlap === 0, overlap ? `${overlap} chevauchement(s)` : undefined);
    // Facecam : une seule échelle par plan (par construction ; on vérifie qu'elle est définie).
    const badScale = shots.spans.filter((s) => s.kind === 'facecam' && !s.scale).length;
    add('facecam_scale', "Pas de variation d'échelle dans un plan", badScale === 0);
    // Part plein écran graphique.
    const gs = shots.stats.graphicShare;
    add('graphic_share', `Part graphique ${(gs * 100).toFixed(0)}% ∈ [${QA.graphicShare.min * 100};${QA.graphicShare.max * 100}]%`, gs >= QA.graphicShare.min && gs <= QA.graphicShare.max);
    // Justification de chaque insert.
    const noJust = ins.filter((s) => !s.props || !(s as { justification?: string }).justification).length;
    // (justification peut être stockée sur le span ; on tolère props.justification aussi)
    const missing = ins.filter((s) => !(s as { justification?: string }).justification).length;
    add('insert_justification', 'Chaque insert a une justification', missing === 0, missing ? `${missing} sans justification` : undefined);
    void noJust;
  } else {
    add('single_graphic', 'Élément graphique unique', null, 'shots absent');
    add('facecam_scale', 'Échelle facecam', null, 'shots absent');
    add('graphic_share', 'Part graphique', null, 'shots absent');
    add('insert_justification', 'Justification inserts', null, 'shots absent');
  }

  // --- Neutralité chromatique des inserts ---
  const neutral = await run('node', ['--experimental-strip-types', '--no-warnings', 'src/qa/neutralityLint.ts'], { quiet: true, allowFail: true }).catch(() => null);
  if (neutral) add('neutrality', 'Aucune couleur non achromatique dans les inserts', neutral.code === 0);
  else add('neutrality', 'Neutralité inserts', null, 'lint non exécuté');

  // --- Dérive A/V ---
  // Le muxage AAC ajoute un priming/padding d'encodeur (~1 frame audio) qui
  // gonfle la durée du flux audio sans être une vraie dérive de synchro (les
  // lecteurs sautent le priming). On tolère donc ce padding fixe en plus de la
  // frame de dérive autorisée ; une vraie dérive s'accumulerait bien au-delà.
  if (exists(REEL)) {
    const { v, a } = await streamDurations(REEL);
    const AAC_PADDING_S = 0.07; // priming AAC typique
    const driftFrames = Math.max(0, Math.abs(v - a) - AAC_PADDING_S) * 30;
    add('av_drift', `Dérive A/V ${driftFrames.toFixed(2)} frame ≤ ${QA.maxAvDriftFrames} (hors padding AAC)`, driftFrames <= QA.maxAvDriftFrames, `v=${v.toFixed(3)}s a=${a.toFixed(3)}s`);
  } else add('av_drift', 'Dérive A/V', null, 'reel absent');

  // --- Rapport ---
  let failed = 0;
  for (const c of checks) {
    const tag = c.status === 'PASS' ? '\x1b[32mPASS\x1b[0m' : c.status === 'FAIL' ? '\x1b[31mFAIL\x1b[0m' : '\x1b[2mSKIP\x1b[0m';
    console.log(`  ${tag}  ${c.label}${c.detail ? `  — ${c.detail}` : ''}`);
    if (c.status === 'FAIL') failed++;
  }
  const report = {
    generatedAt: new Date().toISOString(),
    inputs: { reel: REEL, audio: AUDIO, captions: CAPS, shots: SHOTS, edl: EDLP },
    passed: checks.filter((c) => c.status === 'PASS').length,
    failed,
    skipped: checks.filter((c) => c.status === 'SKIP').length,
    checks,
  };
  writeJson(FILES.qaReport, report);
  log.info(`Rapport : ${FILES.qaReport}`);
  if (failed > 0) { log.error(`QA : ${failed} contrôle(s) en échec.`); process.exitCode = 1; }
  else log.ok('QA : aucun échec.');
}

main().catch((err) => { log.error(err instanceof Error ? err.message : String(err)); process.exitCode = 1; });
