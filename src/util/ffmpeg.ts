/** ffmpeg.ts — wrappers ffmpeg / ffprobe. */

import { run } from './exec.ts';

export interface ProbeResult {
  durationS: number;
  fps: number;
  width: number;
  height: number;
  hasAudio: boolean;
  vfr: boolean;
  raw: unknown;
}

/** ffprobe complet sur un fichier média. */
export async function ffprobe(input: string): Promise<ProbeResult> {
  const { stdout } = await run(
    'ffprobe',
    ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', input],
    { quiet: true },
  );
  const data = JSON.parse(stdout) as {
    streams: Array<Record<string, unknown>>;
    format: Record<string, unknown>;
  };
  const v = data.streams.find((s) => s.codec_type === 'video');
  const a = data.streams.find((s) => s.codec_type === 'audio');
  const parseRate = (r: unknown): number => {
    if (typeof r !== 'string') return 0;
    const [n, d] = r.split('/').map(Number);
    return d ? n / d : n;
  };
  const avg = parseRate(v?.avg_frame_rate);
  const rFps = parseRate(v?.r_frame_rate);
  return {
    durationS: Number(data.format.duration ?? 0),
    fps: avg || rFps,
    width: Number(v?.width ?? 0),
    height: Number(v?.height ?? 0),
    hasAudio: Boolean(a),
    // VFR probable si avg et r divergent nettement.
    vfr: avg > 0 && rFps > 0 && Math.abs(avg - rFps) > 0.01,
    raw: data,
  };
}

/** Lance ffmpeg avec une liste d'arguments (écrase la sortie). */
export async function ffmpeg(args: string[], quiet = true): Promise<void> {
  await run('ffmpeg', ['-hide_banner', '-y', ...args], { quiet });
}
