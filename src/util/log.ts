/** log.ts — journalisation console minimale, sans dépendance. */

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function stamp(): string {
  // Heure locale HH:MM:SS, sans dépendance externe.
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const log = {
  info(msg: string): void {
    console.log(`${c.dim}${stamp()}${c.reset} ${msg}`);
  },
  step(id: string, msg: string): void {
    console.log(`${c.dim}${stamp()}${c.reset} ${c.cyan}[${id}]${c.reset} ${msg}`);
  },
  ok(msg: string): void {
    console.log(`${c.dim}${stamp()}${c.reset} ${c.green}✓${c.reset} ${msg}`);
  },
  warn(msg: string): void {
    console.warn(`${c.dim}${stamp()}${c.reset} ${c.yellow}⚠${c.reset} ${msg}`);
  },
  error(msg: string): void {
    console.error(`${c.dim}${stamp()}${c.reset} ${c.red}✗${c.reset} ${msg}`);
  },
  cache(msg: string): void {
    console.log(`${c.dim}${stamp()} ↺ ${msg} (cache)${c.reset}`);
  },
};
