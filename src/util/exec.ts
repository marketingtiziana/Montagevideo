/** exec.ts — exécution de sous-processus (ffmpeg, ffprobe, python…). */

import { spawn } from 'node:child_process';

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Exécute une commande, capture stdout/stderr. Rejette si code != 0 (sauf allowFail). */
export function run(
  cmd: string,
  args: string[],
  opts: { allowFail?: boolean; cwd?: string; quiet?: boolean } = {},
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => {
      stderr += d.toString();
      if (!opts.quiet) process.stderr.write(d);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      const result = { code: code ?? -1, stdout, stderr };
      if (code === 0 || opts.allowFail) resolve(result);
      else reject(new Error(`${cmd} exited with code ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

/** Vrai si un exécutable est présent dans le PATH. */
export async function has(cmd: string): Promise<boolean> {
  try {
    await run('sh', ['-c', `command -v ${cmd}`], { allowFail: false, quiet: true });
    return true;
  } catch {
    return false;
  }
}
