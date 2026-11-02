import rough from "roughjs/bin/rough";
import type { Options } from "roughjs/bin/core";
import type { ChartElement, ChartSpec } from "@/data/types";
import { rngFor } from "@/lib/rng";

/**
 * Graphiques SVG « dessinés à la main » avec roughjs.
 * Le générateur est pur : même seed, mêmes tracés côté serveur et côté client.
 */
const gen = rough.generator();
const NAVY = "#0F1535";
const INDIGO = "#4F6BFF";
const TINT = "#E8ECFF";
const W = 440;

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
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
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
  size = 22,
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
  anchor?: "middle" | "start" | "end";
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

function Box({
  k,
  x,
  y,
  w,
  h,
  label,
  sub,
  fill = TINT,
  stroke = NAVY,
  dashed = false,
  size = 22,
}: {
  k: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  fill?: string;
  stroke?: string;
  dashed?: boolean;
  size?: number;
}) {
  const opts: Options = {
    stroke,
    strokeWidth: 2.5,
    fill,
    fillStyle: "solid",
    roughness: 1.3,
    bowing: 1,
    seed: seed(k),
    ...(dashed ? { strokeLineDash: [8, 7] } : {}),
  };
  const maxChars = Math.max(6, Math.floor((w - 16) / (size * 0.56)));
  const lines = wrap(label, maxChars);
  const subLines = sub ? wrap(sub, Math.max(6, Math.floor((w - 16) / 12))) : [];
  const total = lines.length * size * 1.15 + (subLines.length ? subLines.length * 25 + 4 : 0);
  const cy = y + h / 2;
  const labelY = cy - total / 2 + (lines.length * size * 1.15) / 2;
  return (
    <>
      <Rough k={k} drawable={gen.rectangle(x, y, w, h, opts)} />
      <Text x={x + w / 2} y={labelY} lines={lines} size={size} />
      {subLines.length > 0 && <Text x={x + w / 2} y={labelY + (lines.length * size * 1.15) / 2 + 4 + (subLines.length * 25) / 2} lines={subLines} size={22} weight={500} color="#64748B" />}
    </>
  );
}

function Arrow({ k, from, to, color = INDIGO, label, dashed = false }: { k: string; from: [number, number]; to: [number, number]; color?: string; label?: string; dashed?: boolean }) {
  const opts: Options = { stroke: color, strokeWidth: 3, roughness: 1.1, seed: seed(k), ...(dashed ? { strokeLineDash: [8, 7] } : {}) };
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const hl = 16;
  const h1: [number, number] = [to[0] + Math.cos(ang + Math.PI * 0.8) * hl, to[1] + Math.sin(ang + Math.PI * 0.8) * hl];
  const h2: [number, number] = [to[0] + Math.cos(ang - Math.PI * 0.8) * hl, to[1] + Math.sin(ang - Math.PI * 0.8) * hl];
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const lw = label ? label.length * 12.5 + 20 : 0;
  return (
    <>
      <Rough k={`${k}/l`} drawable={gen.line(from[0], from[1], to[0], to[1], opts)} />
      <Rough k={`${k}/h1`} drawable={gen.line(to[0], to[1], h1[0], h1[1], { ...opts, strokeLineDash: undefined })} />
      <Rough k={`${k}/h2`} drawable={gen.line(to[0], to[1], h2[0], h2[1], { ...opts, strokeLineDash: undefined })} />
      {label && (
        <>
          <rect x={mx - lw / 2} y={my - 17} width={lw} height={34} rx={17} fill="#fff" stroke={color} strokeWidth={2} />
          <Text x={mx} y={my + 1} lines={[label]} size={22} color={color} />
        </>
      )}
    </>
  );
}

function Org({ c, id }: { c: Extract<ChartSpec, { kind: "org" }>; id: string }) {
  const H = 520;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <Box k={`${id}/sos`} x={14} y={16} w={190} h={78} label={c.sos} />
      <Box k={`${id}/irs`} x={310} y={16} w={116} h={78} label={c.irs} />
      <Arrow k={`${id}/e1`} from={[120, 100]} to={[186, 206]} label={c.edges.registers} />
      <Arrow k={`${id}/e2`} from={[360, 100]} to={[286, 206]} label={c.edges.ein} />
      <Box k={`${id}/agent`} x={4} y={214} w={140} h={92} label={c.agent} />
      <Text x={74} y={330} lines={wrap(c.agentNote, 14)} size={22} weight={500} color="#64748B" />
      <Rough k={`${id}/link`} drawable={gen.line(146, 258, 158, 258, { stroke: NAVY, strokeWidth: 2.5, roughness: 1, seed: seed(`${id}/link`) })} />
      <Box k={`${id}/llc`} x={158} y={210} w={150} h={100} label="" fill="#0F1535" stroke="#0F1535" />
      <text x={233} y={262} fontSize={40} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontFamily="inherit">
        {c.llc}
      </text>
      <Rough k={`${id}/link2`} drawable={gen.line(310, 258, 320, 258, { stroke: INDIGO, strokeWidth: 2.5, roughness: 1, seed: seed(`${id}/link2`), strokeLineDash: [6, 5] })} />
      <Box k={`${id}/mgr`} x={320} y={216} w={116} h={86} label={c.manager} sub={c.managerNote} dashed fill="#fff" />
      <Text x={378} y={326} lines={[c.edges.manages]} size={22} color={INDIGO} />
      <Box k={`${id}/members`} x={118} y={430} w={230} h={74} label={c.members} />
      <Arrow k={`${id}/e4`} from={[233, 426]} to={[233, 318]} label={c.edges.owns} />
    </svg>
  );
}

function Money({ c, id }: { c: Extract<ChartSpec, { kind: "money" }>; id: string }) {
  const step = 118;
  const H = c.steps.length * step - 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {c.steps.map((s, i) => {
        const y = i * step;
        const last = i === c.steps.length - 1;
        return (
          <g key={i}>
            <Box k={`${id}/b${i}`} x={60} y={y} w={320} h={84} label={s.label} sub={s.sub} fill={last ? "#D9F5EE" : i === 0 ? "#fff" : TINT} />
            {i < c.steps.length - 1 && <Arrow k={`${id}/a${i}`} from={[220, y + 88]} to={[220, y + step - 4]} label={c.arrows[i]} color={i === c.steps.length - 2 ? "#2BB39A" : INDIGO} />}
          </g>
        );
      })}
    </svg>
  );
}

function Timeline({ c, id, color }: { c: Extract<ChartSpec, { kind: "timeline" }>; id: string; color: string }) {
  const step = 70;
  const H = c.steps.length * step + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <Rough k={`${id}/line`} drawable={gen.line(44, 36, 44, H - 36, { stroke: NAVY, strokeWidth: 3, roughness: 1, bowing: 0.5, seed: seed(`${id}/line`) })} />
      {c.steps.map((s, i) => {
        const y = 36 + i * step;
        return (
          <g key={i}>
            <Rough k={`${id}/c${i}`} drawable={gen.circle(44, y, 46, { stroke: NAVY, strokeWidth: 2.5, fill: i === c.steps.length - 1 ? color : "#fff", fillStyle: "solid", roughness: 1.2, seed: seed(`${id}/c${i}`) })} />
            <text x={44} y={y + 1} fontSize={22} fontWeight={900} fill={i === c.steps.length - 1 ? "#fff" : NAVY} textAnchor="middle" dominantBaseline="middle" fontFamily="inherit">
              {i + 1}
            </text>
            <Text x={84} y={y} lines={wrap(s, 28)} size={22} anchor="start" />
          </g>
        );
      })}
    </svg>
  );
}

function CalendarChart({ c, id, color }: { c: Extract<ChartSpec, { kind: "calendar" }>; id: string; color: string }) {
  const step = 96;
  const H = c.items.length * step + 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {c.items.map((it, i) => {
        const y = 4 + i * step;
        return (
          <g key={i}>
            <Rough k={`${id}/r${i}`} drawable={gen.rectangle(4, y, W - 8, step - 14, { stroke: NAVY, strokeWidth: 2, fill: "#fff", fillStyle: "solid", roughness: 1.2, seed: seed(`${id}/r${i}`) })} />
            <Rough k={`${id}/p${i}`} drawable={gen.rectangle(14, y + 12, 132, step - 38, { stroke: color, strokeWidth: 2, fill: color, fillStyle: "solid", roughness: 0.8, seed: seed(`${id}/p${i}`) })} />
            <Text x={80} y={y + (step - 14) / 2} lines={wrap(it.when, 11)} size={22} color="#fff" />
            <Text x={162} y={y + (step - 14) / 2} lines={wrap(it.label, 24)} size={22} anchor="start" />
          </g>
        );
      })}
    </svg>
  );
}

function Transparency({ c, id }: { c: Extract<ChartSpec, { kind: "transparency" }>; id: string }) {
  const H = 430;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <Box k={`${id}/llc`} x={70} y={20} w={300} h={120} label={c.llc} sub={c.llcTax} dashed fill="#fff" />
      <Rough k={`${id}/flow`} drawable={gen.line(220, 0, 220, 300, { stroke: INDIGO, strokeWidth: 10, roughness: 2, bowing: 2, seed: seed(`${id}/flow`) })} />
      <Arrow k={`${id}/a`} from={[220, 150]} to={[220, 300]} color={INDIGO} />
      <rect x={236} y={190} width={190} height={40} rx={20} fill="#fff" stroke={INDIGO} strokeWidth={2} />
      <Text x={331} y={211} lines={[c.arrow]} size={22} color={INDIGO} />
      <Box k={`${id}/member`} x={70} y={310} w={300} h={110} label={c.member} sub={c.memberTax} fill="#D9F5EE" />
    </svg>
  );
}

function Funnel({ c, id, color }: { c: Extract<ChartSpec, { kind: "funnel" }>; id: string; color: string }) {
  const step = 74;
  const H = c.bars.length * step + 56;
  const max = Math.max(...c.bars.map((b) => b.weight));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {c.bars.map((b, i) => {
        const y = i * step;
        const w = Math.max(36, ((W - 8) * b.weight) / max);
        return (
          <g key={i}>
            <Text x={4} y={y + 14} lines={[b.label]} size={22} anchor="start" weight={700} />
            <Rough k={`${id}/bar${i}`} drawable={gen.rectangle(4, y + 32, w, 28, { stroke: NAVY, strokeWidth: 2, fill: color, fillStyle: "hachure", hachureGap: 7, fillWeight: 2, roughness: 1.2, seed: seed(`${id}/bar${i}`) })} />
          </g>
        );
      })}
      <Text x={4} y={H - 22} lines={wrap(c.note, 36)} size={22} weight={600} color="#64748B" anchor="start" />
    </svg>
  );
}

export function Chart({ el, color }: { el: ChartElement; color: string }) {
  const c = el.chart;
  return (
    <div className="rounded-2xl border border-[#E3E6EE] bg-white p-5 shadow-card">
      <div className="mb-3 text-[26px] font-black leading-tight text-navy" data-anchor="title">
        {el.title}
      </div>
      {c.kind === "org" && <Org c={c} id={el.id} />}
      {c.kind === "money" && <Money c={c} id={el.id} />}
      {c.kind === "timeline" && <Timeline c={c} id={el.id} color={color} />}
      {c.kind === "calendar" && <CalendarChart c={c} id={el.id} color={color} />}
      {c.kind === "transparency" && <Transparency c={c} id={el.id} />}
      {c.kind === "funnel" && <Funnel c={c} id={el.id} color={color} />}
    </div>
  );
}
