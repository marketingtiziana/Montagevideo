import type { SchemaProps } from './index';
import { INK, MUTED, NAVY, RoughArrow, SchemaBox, SchemaSvg } from './primitives';
import { roughCurvePaths } from '@/lib/rough';
import { hashSeed } from '@/lib/random';

/** Calendrier annuel : annual report ou taxe de l'État, Form 5472 + 1120 pro forma, renouvellement du registered agent. */
export default function Calendar({ accent, soft, seed }: SchemaProps) {
  const cx = 110;
  const cy = 118;
  const r = 74;
  // Anneau « une année », tracé à la main, ouvert en haut pour suggérer le cycle.
  const arc = `M ${cx + 8} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 8} ${cy - r}`;
  const ring = roughCurvePaths(arc, { seed: hashSeed(`${seed}-ring`), stroke: accent, strokeWidth: 2.2, roughness: 0.8 });
  const point = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };
  const p1 = point(38);
  const p2 = point(96);
  const p3 = point(154);
  return (
    <SchemaSvg label="Le calendrier annuel d’une LLC" height={236}>
      <g fill="none" strokeLinecap="round">
        {ring.map((p, i) => (
          <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} />
        ))}
      </g>
      <RoughArrow d={`M ${cx - 18} ${cy - r} L ${cx - 8} ${cy - r}`} end={{ x: cx - 8, y: cy - r, angle: 0 }} stroke={accent} seed={`${seed}-head`} width={2.2} />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={11} fontWeight={900} fill={NAVY}>
        Chaque
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fontWeight={900} fill={NAVY}>
        année
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={MUTED}>
        + comptabilité en continu
      </text>

      {[p1, p2, p3].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={7} fill="#ffffff" stroke={accent} strokeWidth={2} />
          <circle cx={p.x} cy={p.y} r={3} fill={accent} />
        </g>
      ))}

      {/* Rendez-vous, à droite */}
      <SchemaBox x={200} y={22} w={128} h={48} lines={['Annual report', 'ou taxe de l’État']} fill={soft} stroke={soft} color={INK} size={9.5} tag="Secretary of State" />
      <RoughArrow d={`M ${p1.x + 8} ${p1.y - 2} Q 172 52 200 46`} stroke={accent} seed={`${seed}-l1`} width={1.4} />

      <SchemaBox x={200} y={94} w={128} h={48} lines={['Form 5472', '+ 1120 pro forma']} fill={soft} stroke={soft} color={INK} size={9.5} tag="IRS" />
      <RoughArrow d={`M ${p2.x + 8} ${p2.y} Q 176 118 200 118`} stroke={accent} seed={`${seed}-l3`} width={1.4} />

      <SchemaBox x={200} y={166} w={128} h={48} lines={['Renouvellement du', 'Registered Agent']} fill={soft} stroke={soft} color={INK} size={9.5} tag="Prestataire" />
      <RoughArrow d={`M ${p3.x + 8} ${p3.y + 2} Q 172 186 200 190`} stroke={accent} seed={`${seed}-l2`} width={1.4} />
    </SchemaSvg>
  );
}
