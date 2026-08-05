/**
 * Step 6 — podcast mastering. The chain order is not decorative; inverting it
 * degrades the result. Order (section 8):
 *   1. highpass 75Hz          (rumble, plosives, desk noise)
 *   2. denoise afftdn adaptive (never metallic; a little hiss beats underwater)
 *   3. de-esser 5.5–9kHz       (soft 3–4 dB)
 *   4. corrective EQ           (-2.5dB@300, +2dB@3k, +1.5dB shelf@11k)
 *   5. compressor              (3:1, ~4–6 dB GR, single transparent pass)
 *   6. limiter                 (true peak -1 dBTP)
 *   7. loudnorm 2-pass         (measure then apply; target -14 LUFS, LRA 7, TP -1)
 * Optional --room-tone reinjects a very low room bed (-58 dBFS) to mask joins.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import type { AudioReport, Edl } from '../lib/types.js';
import { ffmpeg } from '../lib/ffmpeg.js';
import { log, info, ok } from '../lib/log.js';

const TAG = '06-audio-master';

/**
 * Denoise stage. A GENTLE afftdn (nr=8) measurably lowers the noise floor
 * (~5 dB here) while preserving the voice, without the underwater/metallic
 * artefacts that aggressive settings produce. RNNoise (arnndn) is available via
 * RNNOISE_MODEL but on close lav sources it under-denoises and can warble, so
 * gentle afftdn is the default. Aggressive denoise was a big part of what made
 * the earlier master sound bad — restraint here matters more than raw dB.
 */
function denoiseStage(): string {
  const model = process.env.RNNOISE_MODEL;
  if (model && existsSync(model)) return `arnndn=m=${model}`;
  return 'afftdn=nr=8:nf=-28:tn=1';
}

/**
 * Mastering pre-chain (everything before loudnorm). Tuned WARM and clean:
 * a lav/phone source is already bright, so we tame harshness and roll off the
 * top rather than boosting it — the opposite of a generic "add air" chain.
 *   highpass -> denoise -> warmth -> de-mud -> de-ess -> harshness cut ->
 *   gentle high-shelf cut -> soft compression -> safety limiter.
 */
function preChain(): string {
  // Tuned WARM + DE-ESSED: the source reads harsh/sibilant, so we notch the
  // 5-9kHz sibilance band hard, roll the top off, and add body. Better a touch
  // dark than piercing.
  return [
    'highpass=f=85', // rumble / handling / plosive energy
    denoiseStage(),
    'equalizer=f=170:t=q:w=1.0:g=2.5', // warmth / body
    'equalizer=f=350:t=q:w=1.4:g=-2.5', // remove boxy mud
    'deesser=i=0.6:m=0.5:f=0.12', // strong de-ess on the sibilance band
    'equalizer=f=4000:t=q:w=2.0:g=-2', // ease presence harshness
    'equalizer=f=6500:t=q:w=2.2:g=-5', // hard sibilance/harshness notch
    'equalizer=f=8500:t=q:w=2.2:g=-4', // upper sibilance notch
    'treble=g=-4:f=7500', // firm high-shelf cut -> warmer, softer top
    'lowpass=f=13000', // roll off air/hiss/harshness above 13k
    'acompressor=threshold=-21dB:ratio=2.5:attack=25:release=250:makeup=1.5', // soft, transparent
    'alimiter=limit=0.9:level=false',
  ].join(',');
}

interface LoudnessMeasure {
  input_i: string;
  input_tp: string;
  input_lra: string;
  input_thresh: string;
  target_offset: string;
}

/** Pass 1: measure loudness with loudnorm print_format=json. */
async function measureLoudness(input: string, targetLufs: number): Promise<LoudnessMeasure> {
  const res = await ffmpeg(
    [
      '-i', input,
      '-af', `${preChain()},loudnorm=I=${targetLufs}:LRA=7:TP=-1:print_format=json`,
      '-f', 'null', '-',
    ],
    TAG,
  );
  const m = res.stderr.match(/\{[\s\S]*?\}/g);
  if (!m) throw new Error(`${TAG}: could not parse loudnorm measurement`);
  return JSON.parse(m[m.length - 1]) as LoudnessMeasure;
}

export async function stepAudioMaster(ctx: RunContext, _edl: Edl): Promise<AudioReport> {
  const cached = readArtifact<AudioReport>(ctx, 'audio_report.json');
  const master = join(ctx.workDir, 'audio_master.wav');
  if (cached && existsSync(master)) {
    info(TAG, 'cache hit, skipping (audio_report.json)');
    return cached;
  }

  const cut = readArtifact<{ audio: string }>(ctx, 'cut.json');
  if (!cut) throw new Error(`${TAG}: cut.json missing`);
  const target = ctx.params.lufs;

  log(TAG, `mastering chain -> ${target} LUFS (2-pass loudnorm)`);
  const measured = await measureLoudness(cut.audio, target);
  info(TAG, `measured ${Number(measured.input_i).toFixed(1)} LUFS, TP ${Number(measured.input_tp).toFixed(1)} dBTP, LRA ${Number(measured.input_lra).toFixed(1)}`);

  // Optional room tone: extract 400ms from the quietest head of the cut, loop
  // it very low under the whole track to mask joins.
  const roomToneInput = ctx.params.roomTone ? await buildRoomTone(ctx, cut.audio, master) : null;

  // Pass 2: apply with measured values.
  const loudnormApply =
    `loudnorm=I=${target}:LRA=7:TP=-1:` +
    `measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:` +
    `measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:` +
    `offset=${measured.target_offset}:linear=true:print_format=summary`;

  if (roomToneInput) {
    // Mix room tone under the mastered voice.
    await ffmpeg(
      [
        '-i', cut.audio,
        '-stream_loop', '-1', '-i', roomToneInput,
        '-filter_complex',
        `[0:a]${preChain()}[voice];[1:a]volume=-58dB[tone];[voice][tone]amix=inputs=2:duration=first:dropout_transition=0[mix];[mix]${loudnormApply}[out]`,
        '-map', '[out]',
        '-c:a', 'pcm_s24le', '-ar', '48000',
        master,
      ],
      TAG,
    );
  } else {
    await ffmpeg(
      ['-i', cut.audio, '-af', `${preChain()},${loudnormApply}`, '-c:a', 'pcm_s24le', '-ar', '48000', master],
      TAG,
    );
  }

  // Verify output loudness (quick measure pass, no filters).
  const verify = await ffmpeg(
    ['-i', master, '-af', 'loudnorm=I=' + target + ':LRA=7:TP=-1:print_format=json', '-f', 'null', '-'],
    TAG,
  );
  const vm = verify.stderr.match(/\{[\s\S]*?\}/g);
  const out = vm ? (JSON.parse(vm[vm.length - 1]) as LoudnessMeasure) : null;

  const report: AudioReport = {
    version: 1,
    inputLufs: Number(measured.input_i),
    outputLufs: out ? Number(out.input_i) : target,
    inputTruePeak: Number(measured.input_tp),
    outputTruePeak: out ? Number(out.input_tp) : -1,
    lra: Number(measured.input_lra),
    roomTone: ctx.params.roomTone,
  };
  writeArtifact(ctx, 'audio_report.json', report);
  ok(TAG, `audio_master.wav @ ${report.outputLufs.toFixed(1)} LUFS, TP ${report.outputTruePeak.toFixed(1)} dBTP`);
  return report;
}

/** Extract a short quiet room-tone bed and loop it to the full duration. */
async function buildRoomTone(ctx: RunContext, srcAudio: string, master: string): Promise<string> {
  const tone = join(ctx.workDir, 'room_tone.wav');
  // Take 400ms near the start (usually pre-speech ambience).
  await ffmpeg(['-ss', '0', '-t', '0.4', '-i', srcAudio, '-af', 'afade=t=in:st=0:d=0.05,afade=t=out:st=0.35:d=0.05', '-c:a', 'pcm_s24le', tone], TAG);
  info(TAG, 'room tone bed extracted (400ms, looped under mix)');
  return tone;
}
