import type { ReactNode } from 'react';
import { roughArrowPaths, roughCurvePaths } from '@/lib/rough';
import { hashSeed } from '@/lib/random';

export const NAVY = '#0F1535';
export const INK = '#2B3352';
export const MUTED = '#5F6A86';
export const LINE = '#D6DCE8';

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Lignes de texte (une entrée par ligne). */
  lines: string[];
  fill?: string;
  stroke?: string;
  color?: string;
  weight?: number;
  size?: number;
  dashed?: boolean;
  radius?: number;
  /** Petite étiquette au-dessus de la boîte. */
  tag?: string;
  tagColor?: string;
}

/** Boîte arrondie avec texte centré (style SaaS, net). */
export function SchemaBox({
  x,
  y,
  w,
  h,
  lines,
  fill = '#ffffff',
  stroke = LINE,
  color = NAVY,
  weight = 700,
  size = 11,
  dashed,
  radius = 10,
  tag,
  tagColor = MUTED,
}: BoxProps) {
  const lineHeight = size * 1.25;
  const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;
  return (
    <g>
      {tag && (
        <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={tagColor} letterSpacing="0.06em">
          {tag.toUpperCase()}
        </text>
      )}
      <rect x={x} y={y} width={w} height={h} rx={radius} fill={fill} stroke={stroke} strokeWidth={1.4} strokeDasharray={dashed ? '4 3' : undefined} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + w / 2}
          y={startY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size}
          fontWeight={weight}
          fill={color}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

interface ArrowProps {
  /** Chemin SVG (M ... Q/L ...) du lien. */
  d: string;
  /** Point d'arrivée et angle (radians) pour la pointe de flèche. */
  end?: { x: number; y: number; angle: number };
  stroke: string;
  seed: string;
  width?: number;
  label?: string;
  labelAt?: { x: number; y: number };
  /** Couleur du texte de l'étiquette (par défaut : `stroke`). */
  labelColor?: string;
}

/** Lien « dessiné à la main » (roughjs), avec pointe et étiquette optionnelles. */
export function RoughArrow({ d, end, stroke, seed, width = 1.8, label, labelAt, labelColor }: ArrowProps) {
  const s = hashSeed(seed);
  const curve = roughCurvePaths(d, { seed: s, stroke, strokeWidth: width, roughness: 0.9 });
  const head = end ? roughArrowPaths(end.x, end.y, end.angle, { seed: s + 3, stroke, strokeWidth: width, size: 6 }) : [];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {curve.map((p, i) => (
        <path key={`c${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} />
      ))}
      {head.map((p, i) => (
        <path key={`h${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} />
      ))}
      {label && labelAt && (
        <g>
          <rect
            x={labelAt.x - label.length * 2.9 - 6}
            y={labelAt.y - 7.5}
            width={label.length * 5.8 + 12}
            height={15}
            rx={7.5}
            fill="#ffffff"
            stroke={stroke}
            strokeWidth={1}
          />
          <text x={labelAt.x} y={labelAt.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={600} fill={labelColor ?? stroke}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/** Flèche droite entre deux points, avec pointe orientée. */
export function StraightArrow({
  from,
  to,
  stroke,
  seed,
  label,
  width,
  labelColor,
}: {
  from: [number, number];
  to: [number, number];
  stroke: string;
  seed: string;
  label?: string;
  width?: number;
  labelColor?: string;
}) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <RoughArrow
      d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`}
      end={{ x: to[0], y: to[1], angle }}
      stroke={stroke}
      seed={seed}
      width={width}
      label={label}
      labelAt={label ? { x: (from[0] + to[0]) / 2, y: (from[1] + to[1]) / 2 } : undefined}
      labelColor={labelColor}
    />
  );
}

export function SchemaSvg({ children, height = 230, label }: { children: ReactNode; height?: number; label: string }) {
  return (
    <svg viewBox={`0 0 340 ${height}`} className="block h-auto w-full font-sans" role="img" aria-label={label}>
      {children}
    </svg>
  );
}
