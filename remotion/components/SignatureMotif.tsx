/**
 * SignatureMotif.tsx — motif visuel récurrent (§11.5), réutilisé dans au moins
 * deux inserts pour donner l'impression d'une série (comme la tête-nuage de la
 * référence). Ici : une tête de profil fondue dans un nuage. Achromatique,
 * dessiné en SVG (pas d'image pré-rendue).
 */
import type React from 'react';

export interface SignatureMotifProps {
  size?: number;
  ink?: string; // achromatique uniquement
}

export const SignatureMotif: React.FC<SignatureMotifProps> = ({ size = 520, ink = '#111111' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Nuage. */}
      <path
        d="M52 128 q-22 0 -22 -20 q0 -16 16 -19 q2 -22 26 -22 q16 0 24 13 q10 -6 20 -1 q14 6 12 22 q16 1 16 16 q0 18 -22 18 z"
        fill="none"
        stroke={ink}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* Tête de profil, fondue dans le nuage. */}
      <path
        d="M92 120 q-14 -6 -14 -26 q0 -26 24 -30 q22 -4 30 14 q6 12 -2 20 q6 2 4 8 q-2 5 -8 5 q-1 8 -8 11 q-10 5 -22 2"
        fill="none"
        stroke={ink}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* Œil. */}
      <circle cx={104} cy={92} r={2.2} fill={ink} />
    </svg>
  );
};
