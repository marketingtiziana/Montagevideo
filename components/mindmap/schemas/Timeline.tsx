import type { SchemaProps } from './index';
import { INK, MUTED, RoughArrow } from './primitives';
import { SchemaSvg } from './primitives';

const STEPS: { lines: string[] }[] = [
  { lines: ['Choix de', 'l’État'] },
  { lines: ['Articles of', 'Organization'] },
  { lines: ['EIN'] },
  { lines: ['Operating', 'Agreement'] },
  { lines: ['Compte', 'bancaire'] },
  { lines: ['Outils de', 'paiement'] },
];

/** Timeline de création : État → Articles → EIN → Operating Agreement → compte bancaire → outils de paiement. */
export default function Timeline({ accent, soft, seed }: SchemaProps) {
  const x0 = 42;
  const x1 = 298;
  const y = 110;
  const step = (x1 - x0) / (STEPS.length - 1);
  return (
    <SchemaSvg label="Les étapes de création d’une LLC" height={200}>
      <RoughArrow d={`M ${x0 - 14} ${y} L ${x1 + 22} ${y}`} end={{ x: x1 + 22, y, angle: 0 }} stroke={accent} seed={`${seed}-axis`} width={2} />
      {STEPS.map((s, i) => {
        const x = x0 + i * step;
        const above = i % 2 === 0;
        const ty = above ? y - 34 : y + 34;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={above ? y - 14 : y + 14} stroke={accent} strokeWidth={1.2} />
            <circle cx={x} cy={y} r={7} fill="#ffffff" stroke={accent} strokeWidth={2} />
            <circle cx={x} cy={y} r={3} fill={accent} />
            <rect x={x - 32} y={ty - (s.lines.length === 1 ? 10 : 16)} width={64} height={s.lines.length === 1 ? 20 : 32} rx={8} fill={soft} />
            {s.lines.map((line, j) => (
              <text
                key={j}
                x={x}
                y={ty + (j - (s.lines.length - 1) / 2) * 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontWeight={700}
                fill={INK}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
      <text x={x0 - 14} y={182} fontSize={8.5} fontWeight={600} fill={MUTED}>
        Départ
      </text>
      <text x={x1 + 22} y={182} textAnchor="end" fontSize={8.5} fontWeight={600} fill={MUTED}>
        Prêt à facturer
      </text>
    </SchemaSvg>
  );
}
