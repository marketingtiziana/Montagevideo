import type { SchemaProps } from './index';
import { INK, MUTED, NAVY, RoughArrow, SchemaBox, SchemaSvg, StraightArrow } from './primitives';

/** Transparence fiscale : la LLC ne paie pas l'impôt elle-même, le résultat « traverse » jusqu'au membre. */
export default function Passthrough({ accent, soft, ink, seed }: SchemaProps) {
  return (
    <SchemaSvg label="La transparence fiscale d’une LLC" height={200}>
      <SchemaBox x={14} y={70} w={78} h={44} lines={['Résultat de', 'l’activité']} fill={soft} stroke={soft} color={INK} size={9.5} />

      {/* La LLC, dessinée comme une vitre : contour en pointillé, fond translucide */}
      <rect x={122} y={44} width={96} height={96} rx={14} fill={soft} fillOpacity={0.45} stroke={accent} strokeWidth={1.6} strokeDasharray="5 4" />
      <text x={170} y={62} textAnchor="middle" fontSize={12} fontWeight={900} fill={NAVY}>
        LLC
      </text>
      <text x={170} y={122} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={MUTED}>
        transparente
      </text>
      <text x={170} y={133} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={MUTED}>
        pas d’impôt ici
      </text>

      {/* Le résultat traverse la LLC */}
      <RoughArrow
        d="M 92 92 L 250 92"
        end={{ x: 250, y: 92, angle: 0 }}
        stroke={accent}
        seed={`${seed}-through`}
        width={2.4}
        label="traverse"
        labelAt={{ x: 170, y: 92 }}
        labelColor={ink}
      />

      <SchemaBox x={250} y={70} w={76} h={44} lines={['Membre']} fill="#ffffff" stroke={accent} color={ink} size={12} />

      {/* Impôt dans le pays de résidence */}
      <StraightArrow from={[288, 114]} to={[288, 150]} stroke={accent} seed={`${seed}-tax`} />
      <SchemaBox x={196} y={150} w={132} h={36} lines={['Impôt selon le pays', 'de résidence du membre']} fill={NAVY} stroke={NAVY} color="#ffffff" size={9} weight={700} />
    </SchemaSvg>
  );
}
