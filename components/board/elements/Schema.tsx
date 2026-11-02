import rough from "roughjs/bin/rough";
import type { Options } from "roughjs/bin/core";
import type { SchemaElement, SchemaSpec } from "@/data/types";
import { rngFor } from "@/lib/rng";

/**
 * Mini-schémas SVG de 3 à 5 blocs, tracés à la main avec roughjs.
 * Générateur pur : mêmes tracés côté serveur et côté client.
 */
const gen = rough.generator();
const NAVY = "#0F1535";
const INDIGO = "#4F6BFF";
const TINT = "#E8ECFF";
const MINT = "#D9F5EE";
const W = 400;

const seed = (key: string) => (rngFor(key).seed % 2147483646) + 1;

function Rough({ drawable, k }: { drawable: ReturnType<typeof gen.rectangle>; k: string }) {
  return (
    <>
      {gen.toPaths(drawable).map((p, i) => (
        <path key={`${k}/${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill === "none" ? "none" : p.fill} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </>
  );
}

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function Text({
  x,
  y,
  lines,
  size = 20,
  weight = 700,
  color = NAVY,
  anchor = "middle",
}: {
  x: number;
  y: number;
  lines: string[];
  size?: number;
  weight?: number;
  color?: string;
  anchor?: "middle" | "start";
}) {
  const lh = size * 1.15;
  const y0 = y - ((lines.length - 1) * lh) / 2;
  return (
    <text x={x} y={y0} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} dominantBaseline="middle" fontFamily="inherit">
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

function Box({ k, x, y, w, h, label, sub, fill = TINT, dashed = false, big = false }: { k: string; x: number; y: number; w: number; h: number; label: string; sub?: string; fill?: string; dashed?: boolean; big?: boolean }) {
  const opts: Options = { stroke: NAVY, strokeWidth: 1.5, fill, fillStyle: "solid", roughness: 1.1, bowing: 0.8, seed: seed(k), ...(dashed ? { strokeLineDash: [7, 6] } : {}) };
  const size = big ? 26 : 20;
  const lines = wrap(label, Math.max(6, Math.floor((w - 14) / (size * 0.56))));
  const subLines = sub ? wrap(sub, Math.max(6, Math.floor((w - 14) / 11))) : [];
  const total = lines.length * size * 1.15 + (subLines.length ? subLines.length * 23 + 2 : 0);
  const cy = y + h / 2;
  const labelY = cy - total / 2 + (lines.length * size * 1.15) / 2;
  return (
    <>
      <Rough k={k} drawable={gen.rectangle(x, y, w, h, opts)} />
      <Text x={x + w / 2} y={labelY} lines={lines} size={size} />
      {subLines.length > 0 && <Text x={x + w / 2} y={labelY + (lines.length * size * 1.15) / 2 + 2 + (subLines.length * 23) / 2} lines={subLines} size={20} weight={500} color="#64748B" />}
    </>
  );
}

function Arrow({ k, from, to, color = INDIGO, label }: { k: string; from: [number, number]; to: [number, number]; color?: string; label?: string }) {
  const opts: Options = { stroke: color, strokeWidth: 1.5, roughness: 0.9, seed: seed(k), disableMultiStroke: true };
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const hl = 12;
  const h1: [number, number] = [to[0] + Math.cos(ang + Math.PI * 0.8) * hl, to[1] + Math.sin(ang + Math.PI * 0.8) * hl];
  const h2: [number, number] = [to[0] + Math.cos(ang - Math.PI * 0.8) * hl, to[1] + Math.sin(ang - Math.PI * 0.8) * hl];
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const lw = label ? label.length * 11.5 + 18 : 0;
  return (
    <>
      <Rough k={`${k}/l`} drawable={gen.line(from[0], from[1], to[0], to[1], opts)} />
      <Rough k={`${k}/h1`} drawable={gen.line(to[0], to[1], h1[0], h1[1], opts)} />
      <Rough k={`${k}/h2`} drawable={gen.line(to[0], to[1], h2[0], h2[1], opts)} />
      {label && (
        <>
          <rect x={mx - lw / 2} y={my - 15} width={lw} height={30} rx={15} fill="#fff" stroke={color} strokeWidth={1.5} />
          <Text x={mx} y={my + 1} lines={[label]} size={20} color={color} />
        </>
      )}
    </>
  );
}

function Org({ c, id }: { c: Extract<SchemaSpec, { kind: "org" }>; id: string }) {
  const H = 330;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <Box k={`${id}/sos`} x={10} y={8} w={170} h={60} label={c.sos} />
      <Box k={`${id}/irs`} x={290} y={8} w={100} h={60} label={c.irs} />
      <Arrow k={`${id}/e1`} from={[110, 72]} to={[170, 140]} />
      <Arrow k={`${id}/e2`} from={[330, 72]} to={[262, 140]} />
      <Box k={`${id}/agent`} x={4} y={150} w={128} h={70} label={c.agent} />
      <Box k={`${id}/llc`} x={146} y={144} w={120} h={80} label={c.llc} fill={NAVY} big />
      <Box k={`${id}/mgr`} x={282} y={150} w={114} h={70} label={c.manager} dashed fill="#fff" />
      <Box k={`${id}/members`} x={120} y={262} w={172} h={60} label={c.members} />
      <Arrow k={`${id}/e4`} from={[206, 258]} to={[206, 230]} />
    </svg>
  );
}

function Money({ c, id }: { c: Extract<SchemaSpec, { kind: "money" }>; id: string }) {
  const step = 104;
  const H = c.steps.length * step - 34;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {c.steps.map((s, i) => {
        const y = i * step;
        const last = i === c.steps.length - 1;
        return (
          <g key={i}>
            <Box k={`${id}/b${i}`} x={70} y={y} w={260} h={66} label={s} fill={last ? MINT : i === 0 ? "#fff" : TINT} />
            {i < c.steps.length - 1 && <Arrow k={`${id}/a${i}`} from={[200, y + 70]} to={[200, y + step - 4]} label={c.arrows[i]} color={last ? "#2BB39A" : INDIGO} />}
          </g>
        );
      })}
    </svg>
  );
}

function Transparency({ c, id }: { c: Extract<SchemaSpec, { kind: "transparency" }>; id: string }) {
  const H = 300;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <g opacity={0.3}>
        <Rough k={`${id}/flow`} drawable={gen.line(200, 0, 200, 215, { stroke: INDIGO, strokeWidth: 10, roughness: 1.8, bowing: 1.5, seed: seed(`${id}/flow`) })} />
      </g>
      <Box k={`${id}/llc`} x={70} y={16} w={260} h={92} label={c.llc} sub={c.llcLine} dashed fill="#fff" />
      <Arrow k={`${id}/a`} from={[200, 112]} to={[200, 212]} />
      <rect x={214} y={146} width={c.through.length * 11.5 + 18} height={30} rx={15} fill="#fff" stroke={INDIGO} strokeWidth={1.5} />
      <Text x={214 + (c.through.length * 11.5 + 18) / 2} y={162} lines={[c.through]} size={20} color={INDIGO} />
      <Box k={`${id}/member`} x={70} y={216} w={260} h={78} label={c.member} sub={c.memberLine} fill={MINT} />
    </svg>
  );
}

export function Schema({ el }: { el: SchemaElement }) {
  const c = el.schema;
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white px-4 pb-3 pt-3 shadow-card">
      <div className="mb-2 text-[22px] font-black leading-tight text-navy">{el.title}</div>
      {c.kind === "org" && <Org c={c} id={el.id} />}
      {c.kind === "money" && <Money c={c} id={el.id} />}
      {c.kind === "transparency" && <Transparency c={c} id={el.id} />}
    </div>
  );
}
