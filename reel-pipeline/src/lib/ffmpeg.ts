/**
 * Typed ffmpeg / ffprobe wrapper. Every invocation is logged verbatim to
 * run.log so it can be copy-pasted. We never use `-c copy` for cutting: it
 * snaps to keyframes and desyncs audio. All re-encodes are frame-accurate.
 */
import { spawn } from 'node:child_process';
import { logCmd } from './log.js';

const FFMPEG = process.env.FFMPEG_BIN ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE_BIN ?? 'ffprobe';

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

function run(bin: string, args: string[], tag = 'ffmpeg'): Promise<RunResult> {
  logCmd(tag, [bin, ...args]);
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d.toString()));
    p.stderr.on('data', (d) => (stderr += d.toString()));
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve({ code: code ?? 0, stdout, stderr });
      else reject(new Error(`${bin} exited ${code}\n${stderr.slice(-4000)}`));
    });
  });
}

export function ffmpeg(args: string[], tag = 'ffmpeg'): Promise<RunResult> {
  // -y overwrite, -hide_banner, -nostdin for non-interactive runs.
  return run(FFMPEG, ['-hide_banner', '-nostdin', '-y', ...args], tag);
}

export function ffprobe(args: string[], tag = 'ffprobe'): Promise<RunResult> {
  return run(FFPROBE, ['-hide_banner', ...args], tag);
}

export interface ProbeStreams {
  format: {
    duration?: string;
    format_name?: string;
  };
  streams: Array<{
    codec_type: string;
    codec_name?: string;
    width?: number;
    height?: number;
    channels?: number;
    sample_rate?: string;
    avg_frame_rate?: string;
    r_frame_rate?: string;
  }>;
}

export async function probeJson(input: string): Promise<ProbeStreams> {
  const res = await ffprobe([
    '-v', 'error',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    input,
  ]);
  return JSON.parse(res.stdout) as ProbeStreams;
}

/** Parse a "num/den" rational like "30000/1001" -> 29.97. */
export function parseRational(r?: string): number {
  if (!r) return 0;
  const [n, d] = r.split('/').map(Number);
  if (!d) return n || 0;
  return n / d;
}

/** Detect VFR by comparing r_frame_rate and avg_frame_rate. */
export function isVariableFramerate(rFrame?: string, avgFrame?: string): boolean {
  const r = parseRational(rFrame);
  const a = parseRational(avgFrame);
  if (!r || !a) return false;
  return Math.abs(r - a) / r > 0.01; // >1% divergence => treat as VFR
}
