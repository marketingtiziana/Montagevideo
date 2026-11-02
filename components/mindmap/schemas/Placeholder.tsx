import type { SchemaProps } from './index';

/** Schéma provisoire (remplacé à l'étape 4). */
export default function Placeholder({ accent, soft }: SchemaProps) {
  return (
    <svg viewBox="0 0 320 200" className="block h-auto w-full" aria-hidden>
      <rect x="20" y="20" width="280" height="160" rx="16" fill={soft} />
      <rect x="120" y="80" width="80" height="40" rx="10" fill="#ffffff" stroke={accent} strokeWidth="2" />
      <text x="160" y="105" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" fill={accent}>
        LLC
      </text>
    </svg>
  );
}
